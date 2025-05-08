# Services pour la logique métier liée au matching IA et à l'OpenAI

from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer # Pour les embeddings locaux

# Importer les modèles nécessaires
from ..models import user_model, profile_model, pod_model
from ..schemas import user_schema, profile_schema, pod_schema # Pour typer les retours
from ..config import OPENAI_API_KEY
from ..database import SessionLocal # Pour les opérations en tâche de fond si nécessaire

# Initialisation du client OpenAI (si utilisé pour les embeddings)
# import openai
# if OPENAI_API_KEY:
# openai.api_key = OPENAI_API_KEY

# Initialisation du modèle SentenceTransformer
# Vous pouvez choisir un modèle pré-entraîné adapté à votre langue et à la nature des textes.
# Pour le français, des modèles comme 'distiluse-base-multilingual-cased-v1' ou 'camembert-base' peuvent être envisagés.
# Pour des raisons de simplicité et de performance, nous utiliserons un modèle plus léger ici.
# Assurez-vous que ce modèle est téléchargé lors du build de l'application (peut prendre du temps la première fois).
embedding_model_name = 'all-MiniLM-L6-v2' # Modèle multilingue léger
try:
    sbert_model = SentenceTransformer(embedding_model_name)
except Exception as e:
    print(f"Erreur lors du chargement du modèle SentenceTransformer {embedding_model_name}: {e}")
    sbert_model = None

# --- Fonctions d'Embeddings ---
def get_embedding_openai(text: str) -> Optional[List[float]]:
    """Génère un embedding en utilisant l'API OpenAI."""
    if not OPENAI_API_KEY:
        print("Clé API OpenAI non configurée pour les embeddings.")
        return None
    # try:
    #     response = openai.Embedding.create(input=[text], model="text-embedding-ada-002")
    #     return response['data'][0]['embedding']
    # except Exception as e:
    #     print(f"Erreur lors de la génération d'embedding OpenAI: {e}")
    #     return None
    print("La génération d'embedding OpenAI n'est pas active (code commenté).")
    return None # Code commenté pour l'instant

def get_embedding_sbert(text: str) -> Optional[List[float]]:
    """Génère un embedding en utilisant SentenceTransformer."""
    if sbert_model is None:
        print("Modèle SentenceTransformer non chargé.")
        return None
    try:
        embedding = sbert_model.encode(text)
        return embedding.tolist()
    except Exception as e:
        print(f"Erreur lors de la génération d'embedding SBERT: {e}")
        return None

def get_pod_embedding(db: Session, pod_id: int, use_openai: bool = False) -> Optional[List[float]]:
    """Récupère ou génère l'embedding pour la transcription d'un pod."""
    pod = db.query(pod_model.Pod).filter(pod_model.Pod.id == pod_id).first()
    if not pod or not pod.transcription:
        return None

    if pod.embedding: # Supposant que vous avez ajouté un champ embedding au modèle Pod
        return pod.embedding

    # Générer et sauvegarder l'embedding si non existant
    # print(f"Génération de l'embedding pour le pod {pod_id}...")
    # embedding = get_embedding_openai(pod.transcription) if use_openai else get_embedding_sbert(pod.transcription)
    # if embedding:
    #     pod.embedding = embedding
    #     db.commit()
    #     print(f"Embedding pour le pod {pod_id} sauvegardé.")
    # return embedding
    # Pour l'instant, on ne sauvegarde pas l'embedding dans ce service, cela devrait être fait lors de la création/transcription du pod
    # On va juste le générer à la volée pour le matching
    return get_embedding_openai(pod.transcription) if use_openai else get_embedding_sbert(pod.transcription)

# --- Fonctions de Calcul de Score Partiel ---
def calculate_disc_compatibility(profile1: profile_model.Profile, profile2: profile_model.Profile) -> float:
    """Calcule un score de compatibilité basé sur les profils DISC."""
    if not profile1.disc_type or not profile2.disc_type:
        return 0.0
    # Logique de compatibilité simplifiée (à affiner selon des théories DISC)
    # Exemple: Identique = 1.0, Complémentaire (ex: D-S, I-C) = 0.7, Opposé = 0.3
    if profile1.disc_type == profile2.disc_type:
        return 1.0
    # Ajoutez ici une logique plus fine pour les complémentarités
    # Par exemple, si D et I sont considérés comme compatibles:
    # compatible_pairs = [('D', 'I'), ('I', 'D'), ('S', 'C'), ('C', 'S')]
    # if (profile1.disc_type, profile2.disc_type) in compatible_pairs:
    # return 0.7
    return 0.5 # Score par défaut pour des types différents non spécifiquement compatibles

def calculate_interests_similarity(profile1: profile_model.Profile, profile2: profile_model.Profile) -> float:
    """Calcule un score basé sur les intérêts communs."""
    # Supposons que les intérêts sont stockés comme une liste de strings dans profile.interests
    # Exemple: profile1.interests = ["technologie", "musique"]
    # Ceci nécessite d'ajouter un champ 'interests' au modèle Profile et au schéma Profile
    interests1 = set(getattr(profile1, 'interests', []))
    interests2 = set(getattr(profile2, 'interests', []))
    if not interests1 or not interests2:
        return 0.0
    common_interests = interests1.intersection(interests2)
    union_interests = interests1.union(interests2)
    if not union_interests:
        return 0.0
    return len(common_interests) / len(union_interests) # Jaccard similarity

def calculate_content_similarity(db: Session, user1_id: int, user2_id: int, use_openai_embeddings: bool = False) -> float:
    """Calcule la similarité de contenu basée sur les embeddings des pods des utilisateurs."""
    user1_pods = db.query(pod_model.Pod).filter(pod_model.Pod.user_id == user1_id, pod_model.Pod.transcription != None).all()
    user2_pods = db.query(pod_model.Pod).filter(pod_model.Pod.user_id == user2_id, pod_model.Pod.transcription != None).all()

    if not user1_pods or not user2_pods:
        return 0.0

    user1_embeddings = [get_pod_embedding(db, pod.id, use_openai_embeddings) for pod in user1_pods]
    user1_embeddings = [emb for emb in user1_embeddings if emb is not None]
    user2_embeddings = [get_pod_embedding(db, pod.id, use_openai_embeddings) for pod in user2_pods]
    user2_embeddings = [emb for emb in user2_embeddings if emb is not None]

    if not user1_embeddings or not user2_embeddings:
        return 0.0

    # Calculer la similarité cosinus moyenne entre tous les pods des deux utilisateurs
    # Pour simplifier, on peut prendre l'embedding moyen pour chaque utilisateur
    avg_emb1 = np.mean(np.array(user1_embeddings), axis=0).reshape(1, -1)
    avg_emb2 = np.mean(np.array(user2_embeddings), axis=0).reshape(1, -1)

    if avg_emb1.shape[1] == 0 or avg_emb2.shape[1] == 0: # Cas où il n'y a pas d'embeddings valides
        return 0.0
        
    similarity = cosine_similarity(avg_emb1, avg_emb2)
    return max(0.0, similarity[0][0]) # S'assurer que c'est entre 0 et 1

def calculate_objectives_match(profile1: profile_model.Profile, profile2: profile_model.Profile) -> float:
    """Calcule un score basé sur la compatibilité des objectifs."""
    # Supposons que les objectifs sont stockés dans profile.objectives (ex: "cherche mentor", "propose mentorat")
    # Ceci nécessite d'ajouter un champ 'objectives' au modèle Profile et au schéma Profile
    objectives1 = getattr(profile1, 'objectives', None)
    objectives2 = getattr(profile2, 'objectives', None)
    if not objectives1 or not objectives2:
        return 0.0
    # Logique de matching d'objectifs (simplifiée)
    if objectives1 == "cherche mentor" and objectives2 == "propose mentorat":
        return 1.0
    if objectives1 == "propose mentorat" and objectives2 == "cherche mentor":
        return 1.0
    # Ajouter d'autres logiques de compatibilité
    return 0.0

# --- Service de Matching Principal ---
async def find_ia_matches(
    db: Session, 
    user_id: int, 
    limit: int = 10,
    use_openai_embeddings: bool = False # Paramètre pour choisir la source d'embedding
) -> List[Dict[str, Any]]:
    """
    Trouve des correspondances (utilisateurs) basées sur une combinaison de critères.
    """
    current_user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not current_user or not current_user.profile:
        return []
    current_user_profile = current_user.profile[0] # Supposant une relation one-to-one ou one-to-many où on prend le premier profil

    all_other_users = db.query(user_model.User).filter(user_model.User.id != user_id).all()
    
    potential_matches: List[Tuple[user_model.User, float, Dict[str, float]]] = []

    # Définition des poids pour chaque critère (à ajuster)
    weights = {
        "disc": 0.3,
        "interests": 0.25,
        "content": 0.35,
        "objectives": 0.1
    }

    for other_user in all_other_users:
        if not other_user.profile:
            continue
        other_user_profile = other_user.profile[0]

        # Calcul des scores partiels
        score_disc = calculate_disc_compatibility(current_user_profile, other_user_profile)
        score_interests = calculate_interests_similarity(current_user_profile, other_user_profile)
        score_content = await asyncio.to_thread(calculate_content_similarity, db, current_user.id, other_user.id, use_openai_embeddings)
        score_objectives = calculate_objectives_match(current_user_profile, other_user_profile)

        # Calcul du score global pondéré
        total_score = (
            weights["disc"] * score_disc +
            weights["interests"] * score_interests +
            weights["content"] * score_content +
            weights["objectives"] * score_objectives
        )
        
        # Stocker les détails du score pour explication potentielle
        score_details = {
            "disc_score": round(score_disc, 2),
            "interests_score": round(score_interests, 2),
            "content_score": round(score_content, 2),
            "objectives_score": round(score_objectives, 2),
            "overall_score": round(total_score, 2)
        }

        if total_score > 0.1: # Seuil minimal pour considérer un match
            potential_matches.append((other_user, total_score, score_details))

    # Trier les matchs par score décroissant
    potential_matches.sort(key=lambda x: x[1], reverse=True)

    # Formater le résultat
    results = []
    for matched_user_obj, score, details in potential_matches[:limit]:
        profile_data = profile_schema.Profile.from_orm(matched_user_obj.profile[0]) if matched_user_obj.profile else None
        results.append({
            "user": user_schema.User.from_orm(matched_user_obj),
            "profile": profile_data,
            "match_score": round(score, 2),
            "score_details": details,
            "match_reason": f"Matching global basé sur DISC, intérêts, contenu des pods et objectifs."
        })
    
    return results

# --- Service pour le Bot IA (inchangé pour l'instant, mais pourrait utiliser les embeddings) ---
async def get_ia_bot_response(prompt: str, user_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Obtient une réponse d'un bot IA basé sur OpenAI.
    """
    if not OPENAI_API_KEY:
        return {"error": "OpenAI API key not configured."}
    
    # try:
    #     client = openai.OpenAI(api_key=OPENAI_API_KEY)
    #     response = client.chat.completions.create(
    #         model="gpt-3.5-turbo",
    #         messages=[
    #             {"role": "system", "content": "You are a helpful assistant for the Spotbulle platform."},
    #             {"role": "user", "content": prompt}
    #         ]
    #     )
    #     bot_message = response.choices[0].message.content
    #     return {"response": bot_message}
    # except Exception as e:
    #     return {"error": f"Error communicating with OpenAI: {str(e)}"}
    
    return {"response": f"IA Bot (simulé): Vous avez dit '{prompt}'. L'intégration OpenAI est en cours de développement."}


# --- Tâches de fond potentielles ---
# (Exemple: pour pré-calculer les embeddings des pods)
# import asyncio
# async def update_pod_embedding_task(pod_id: int, use_openai: bool = False):
#     db = SessionLocal()
#     try:
#         pod = db.query(pod_model.Pod).filter(pod_model.Pod.id == pod_id).first()
#         if pod and pod.transcription and not pod.embedding:
#             print(f"[TASK] Génération de l'embedding pour le pod {pod_id}...")
#             embedding_value = get_embedding_openai(pod.transcription) if use_openai else get_embedding_sbert(pod.transcription)
#             if embedding_value:
#                 pod.embedding = embedding_value # Assurez-vous que le modèle Pod a un champ `embedding` de type JSON ou Array(Float)
#                 db.commit()
#                 print(f"[TASK] Embedding pour le pod {pod_id} sauvegardé.")
#             else:
#                 print(f"[TASK] Échec de la génération de l'embedding pour le pod {pod_id}.")
#     except Exception as e:
#         print(f"[TASK] Erreur lors de la mise à jour de l'embedding du pod {pod_id}: {e}")
#     finally:
#         db.close()

# Pour exécuter en tâche de fond (nécessite une configuration avec BackgroundTasks de FastAPI ou Celery/RQ)
# from fastapi import BackgroundTasks
# def some_route_handler(background_tasks: BackgroundTasks, pod_id: int):
#     # ... autre logique ...
#     background_tasks.add_task(update_pod_embedding_task, pod_id, use_openai=False)
#     return {"message": "Traitement de l'embedding en arrière-plan"}

