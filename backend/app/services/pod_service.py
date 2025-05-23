# Fonctions CRUD (Create, Read, Update, Delete) pour le modèle Pod

from sqlalchemy.orm import Session
from typing import Optional, List

from .models import pod_model
from .schemas import pod_schema

def get_pod(db: Session, pod_id: int) -> Optional[pod_model.Pod]:
    return db.query(pod_model.Pod).filter(pod_model.Pod.id == pod_id).first()

def get_pods_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[pod_model.Pod]:
    return db.query(pod_model.Pod).filter(pod_model.Pod.owner_id == owner_id).offset(skip).limit(limit).all()

def get_all_pods(db: Session, skip: int = 0, limit: int = 100) -> List[pod_model.Pod]:
    return db.query(pod_model.Pod).offset(skip).limit(limit).all()

def create_pod(db: Session, title: str, description: Optional[str], tags: List[str], audio_url: str, owner_id: int) -> pod_model.Pod:
    # La logique de l'audio_file_url est gérée dans la route maintenant
    db_pod = pod_model.Pod(
        title=title,
        description=description,
        tags=tags,
        audio_file_url=audio_url,
        owner_id=owner_id
    )
    db.add(db_pod)
    db.commit()
    db.refresh(db_pod)
    return db_pod

def update_pod(db: Session, pod_id: int, update_data: dict) -> Optional[pod_model.Pod]:
    db_pod = get_pod(db, pod_id)
    if not db_pod:
        return None

    for key, value in update_data.items():
        setattr(db_pod, key, value)

    db.commit()
    db.refresh(db_pod)
    return db_pod

def update_pod_transcription(db: Session, pod_id: int, transcription: str) -> Optional[pod_model.Pod]:
    """
    Met à jour uniquement le champ de transcription d'un pod.
    """
    db_pod = get_pod(db, pod_id)
    if not db_pod:
        return None
    
    db_pod.transcription = transcription
    db.commit()
    db.refresh(db_pod)
    return db_pod

def delete_pod(db: Session, pod_id: int) -> Optional[pod_model.Pod]:
    db_pod = get_pod(db, pod_id)
    if not db_pod:
        return None
    # La suppression du fichier audio associé est gérée dans la route
    db.delete(db_pod)
    db.commit()
    # Retourner les données du pod supprimé peut être utile pour la confirmation ou le logging
    # Mais comme il est supprimé, on ne peut plus le rafraîchir. On retourne l'objet avant suppression.
    return db_pod

# Alias pour compatibilité
get_pods = get_all_pods
