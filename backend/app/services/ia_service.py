import os
import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
import numpy as np

# --- Configuration du logging ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("spotbulle-ia-service")

# --- Configuration SBERT & OpenAI ---
from ..config import settings

embedding_model_name = 'all-MiniLM-L6-v2'
sbert_model = None

if settings.OPENAI_API_KEY:
    try:
        import openai
        openai.api_key = settings.OPENAI_API_KEY
        logger.info("OpenAI API configurée avec succès")
    except ImportError:
        logger.warning("Module OpenAI non disponible")
        openai = None

# --- Import interne ---
from ..models import user_model, profile_model, pod_model
from ..schemas import user_schema, profile_schema, pod_schema
from ..database import SessionLocal

# --- Fonctions de similarité sans dépendance à sklearn ---
def cosine_similarity_manual(a, b):
    """Implémentation manuelle de la similarité cosinus sans sklearn"""
    try:
        dot_product = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        return dot_product / (norm_a * norm_b)
    except Exception as e:
        logger.error(f"Erreur dans le calcul de similarité cosinus: {e}")
        return 0.0

# --- Chargement paresseux du modèle SBERT ---
def load_sbert_model():
    global sbert_model
    if sbert_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            sbert_model = SentenceTransformer(embedding_model_name)
            logger.info("Modèle SBERT chargé avec succès")
        except ImportError:
            logger.warning("Module sentence_transformers non disponible")
            sbert_model = None
        except Exception as e:
            logger.error(f"[Erreur] Chargement paresseux SBERT : {e}")
            sbert_model = None
    return sbert_model

# --- Embeddings ---
def get_embedding_sbert(text: str) -> Optional[List[float]]:
    model = load_sbert_model()
    if not model:
        logger.warning("Modèle SBERT non disponible pour l'embedding")
        return None
    try:
        return model.encode(text).tolist()
    except Exception as e:
        logger.error(f"[Erreur] Embedding SBERT : {e}")
        return None

def get_embedding_openai(text: str) -> Optional[List[float]]:
    if not openai:
        logger.warning("Module OpenAI non disponible pour l'embedding")
        return None
    try:
        result = openai.Embedding.create(input=[text], model="text-embedding-ada-002")
        return result["data"][0]["embedding"]
    except Exception as e:
        logger.error(f"[Erreur] Embedding OpenAI : {e}")
        return None

def get_pod_embedding(db: Session, pod_id: int, use_openai: bool = False) -> Optional[List[float]]:
    pod = db.query(pod_model.Pod).filter_by(id=pod_id).first()
    if not pod or not pod.transcription:
        return None
    if pod.embedding:
        return pod.embedding

    embedding = get_embedding_openai(pod.transcription) if use_openai else get_embedding_sbert(pod.transcription)
    if embedding:
        pod.embedding = embedding
        db.commit()
    return embedding

# --- Réponse OpenAI ---
def generate_openai_response(prompt: str) -> Dict[str, str]:
    if not openai:
        return {"error": "Module OpenAI non disponible"}
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for the Spotbulle platform."},
                {"role": "user", "content": prompt}
            ]
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        logger.error(f"Erreur OpenAI : {e}")
        return {"error": f"Erreur OpenAI : {str(e)}"}

# --- Similarité de profil ---
def calculate_disc_compatibility(profile1: profile_model.Profile, profile2: profile_model.Profile) -> float:
    if not profile1.disc_type or not profile2.disc_type:
        return 0.0
    return 1.0 if profile1.disc_type == profile2.disc_type else 0.5

def calculate_interests_similarity(profile1: profile_model.Profile, profile2: profile_model.Profile) -> float:
    i1 = set(getattr(profile1, 'interests', []))
    i2 = set(getattr(profile2, 'interests', []))
    if not i1 or not i2:
        return 0.0
    return len(i1 & i2) / len(i1 | i2)

def calculate_objectives_match(profile1: profile_model.Profile, profile2: profile_model.Profile) -> float:
    o1 = getattr(profile1, 'objectives', None)
    o2 = getattr(profile2, 'objectives', None)
    if not o1 or not o2:
        return 0.0
    if (o1 == "cherche mentor" and o2 == "propose mentorat") or (o1 == "propose mentorat" and o2 == "cherche mentor"):
        return 1.0
    return 0.0

def calculate_content_similarity(db: Session, user1_id: int, user2_id: int, use_openai: bool = False) -> float:
    pods1 = db.query(pod_model.Pod).filter_by(user_id=user1_id).all()
    pods2 = db.query(pod_model.Pod).filter_by(user_id=user2_id).all()

    emb1 = [get_pod_embedding(db, pod.id, use_openai) for pod in pods1 if pod.transcription]
    emb2 = [get_pod_embedding(db, pod.id, use_openai) for pod in pods2 if pod.transcription]

    emb1 = [e for e in emb1 if e]
    emb2 = [e for e in emb2 if e]

    if not emb1 or not emb2:
        return 0.0

    avg1 = np.mean(emb1, axis=0).reshape(1, -1)
    avg2 = np.mean(emb2, axis=0).reshape(1, -1)

    # Utilisation de notre implémentation manuelle au lieu de sklearn
    return float(cosine_similarity_manual(avg1.flatten(), avg2.flatten()))

# --- IA Matching ---
async def find_ia_matches(
    db: Session,
    user_id: int,
    limit: int = 10,
    use_openai_embeddings: bool = False
) -> List[Dict[str, Any]]:
    user = db.query(user_model.User).filter_by(id=user_id).first()
    if not user or not user.profile:
        return []

    user_profile = user.profile[0]
    other_users = db.query(user_model.User).filter(user_model.User.id != user_id).all()
    matches = []

    for other in other_users:
        if not other.profile:
            continue

        profile = other.profile[0]

        disc = calculate_disc_compatibility(user_profile, profile)
        interests = calculate_interests_similarity(user_profile, profile)
        objectives = calculate_objectives_match(user_profile, profile)
        content = calculate_content_similarity(db, user_id, other.id, use_openai_embeddings)

        score = round(0.25 * (disc + interests + objectives + content), 3)

        matches.append({
            "user_id": other.id,
            "score": score,
            "disc": disc,
            "interests": interests,
            "objectives": objectives,
            "content": content
        })

    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches[:limit]
