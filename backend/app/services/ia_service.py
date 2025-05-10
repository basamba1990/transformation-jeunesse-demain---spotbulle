# Importations nécessaires
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import openai

# Modèles et schémas internes
from ..models import user_model, profile_model, pod_model
from ..schemas import user_schema, profile_schema, pod_schema
from ..config import OPENAI_API_KEY
from ..database import SessionLocal

# --- Configuration de l'API OpenAI ---
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

# --- Chargement du modèle SentenceTransformer (SBERT) ---
embedding_model_name = 'all-MiniLM-L6-v2'
try:
    sbert_model = SentenceTransformer(embedding_model_name)
except Exception as e:
    print(f"Erreur lors du chargement du modèle SBERT : {e}")
    sbert_model = None

# --- Fonction pour générer une réponse IA via OpenAI ---
def generate_openai_response(prompt: str) -> Dict[str, str]:
    """
    Envoie un prompt à l'API OpenAI pour obtenir une réponse générée.
    """
    try:
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for the Spotbulle platform."},
                {"role": "user", "content": prompt}
            ]
        )
        bot_message = response.choices[0].message.content
        return {"response": bot_message}
    except Exception as e:
        return {"error": f"Error communicating with OpenAI: {str(e)}"}

# --- Fonctions d'Embeddings ---

def get_embedding_openai(text: str) -> Optional[List[float]]:
    """Génère un embedding avec le modèle d'OpenAI."""
    try:
        response = openai.Embedding.create(input=[text], model="text-embedding-ada-002")
        return response['data'][0]['embedding']
    except Exception as e:
        print(f"Erreur OpenAI: {e}")
        return None

def get_embedding_sbert(text: str) -> Optional[List[float]]:
    """Génère un embedding avec le modèle SBERT."""
    if sbert_model is None:
        return None
    try:
        return sbert_model.encode(text).tolist()
    except Exception as e:
        print(f"Erreur SBERT: {e}")
        return None

def get_pod_embedding(db: Session, pod_id: int, use_openai: bool = False) -> Optional[List[float]]:
    """
    Récupère ou génère l'embedding d’un pod à partir de sa transcription,
    et le sauvegarde en base si nécessaire.
    """
    pod = db.query(pod_model.Pod).filter(pod_model.Pod.id == pod_id).first()
    if not pod or not pod.transcription:
        return None
    if pod.embedding:
        return pod.embedding

    embedding = get_embedding_openai(pod.transcription) if use_openai else get_embedding_sbert(pod.transcription)

    if embedding:
        pod.embedding = embedding
        db.commit()

    return embedding

# --- Fonctions de compatibilité entre profils ---

def calculate_disc_compatibility(profile1: profile_model.Profile, profile2: profile_model.Profile) -> float:
    """
    Compare les types DISC entre deux profils.
    """
    if not profile1.disc_type or not profile2.disc_type:
        return 0.0
    return 1.0 if profile1.disc_type == profile2.disc_type else 0.5

def calculate_interests_similarity(profile1: profile_model.Profile, profile2: profile_model.Profile) -> float:
    """
    Calcule la similarité entre les centres d'intérêt.
    """
    interests1 = set(getattr(profile1, 'interests', []))
    interests2 = set(getattr(profile2, 'interests', []))
    if not interests1 or not interests2:
        return 0.0
    return len(interests1 & interests2) / len(interests1 | interests2)

def calculate_objectives_match(profile1: profile_model.Profile, profile2: profile_model.Profile) -> float:
    """
    Vérifie la compatibilité des objectifs de mentorat.
    """
    obj1 = getattr(profile1, 'objectives', None)
    obj2 = getattr(profile2, 'objectives', None)
    if not obj1 or not obj2:
        return 0.0
    if (obj1 == "cherche mentor" and obj2 == "propose mentorat") or (obj1 == "propose mentorat" and obj2 == "cherche mentor"):
        return 1.0
    return 0.0

def calculate_content_similarity(db: Session, user1_id: int, user2_id: int, use_openai: bool = False) -> float:
    """
    Calcule la similarité entre les contenus audio (pods) de deux utilisateurs.
    """
    pods1 = db.query(pod_model.Pod).filter_by(user_id=user1_id).all()
    pods2 = db.query(pod_model.Pod).filter_by(user_id=user2_id).all()

    emb1 = [get_pod_embedding(db, pod.id, use_openai) for pod in pods1 if pod.transcription]
    emb2 = [get_pod_embedding(db, pod.id, use_openai) for pod in pods2 if pod.transcription]

    emb1 = [e for e in emb1 if e]
    emb2 = [e for e in emb2 if e]

    if not emb1 or not emb2:
        return 0.0

    avg1 = np.mean(np.array(emb1), axis=0).reshape(1, -1)
    avg2 = np.mean(np.array(emb2), axis=0).reshape(1, -1)

    return float(cosine_similarity(avg1, avg2)[0][0])

# --- Fonction principale de matching IA ---

async def find_ia_matches(
    db: Session,
    user_id: int,
    limit: int = 10,
    use_openai_embeddings: bool = False
) -> List[Dict[str, Any]]:
    """
    Fonction principale qui retourne une liste de profils compatibles avec l’utilisateur donné.
    """
    current_user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not current_user or not current_user.profile:
        return []

    current_profile = current_user.profile[0]
    all_users = db.query(user_model.User).filter(user_model.User.id != user_id).all()
    matches = []

    for other_user in all_users:
        if not other_user.profile:
            continue

        other_profile = other_user.profile[0]

        disc_score = calculate_disc_compatibility(current_profile, other_profile)
        interests_score = calculate_interests_similarity(current_profile, other_profile)
        objectives_score = calculate_objectives_match(current_profile, other_profile)
        content_score = calculate_content_similarity(db, user_id, other_user.id, use_openai_embeddings)

        total_score = (
            0.25 * disc_score +
            0.25 * interests_score +
            0.25 * objectives_score +
            0.25 * content_score
        )

        matches.append({
            "user_id": other_user.id,
            "score": round(total_score, 3),
            "disc": disc_score,
            "interests": interests_score,
            "objectives": objectives_score,
            "content": content_score
        })

    matches.sort(key=lambda m: m["score"], reverse=True)
    return matches[:limit]
