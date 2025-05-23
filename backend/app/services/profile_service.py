# Services pour la gestion des profils utilisateurs

from sqlalchemy.orm import Session
from typing import Optional, List

from ..models import profile_model, user_model
from ..schemas import profile_schema

def get_profile_by_user_id(db: Session, user_id: int) -> Optional[profile_model.Profile]:
    return db.query(profile_model.Profile).filter(profile_model.Profile.user_id == user_id).first()

def create_user_profile(db: Session, user: user_model.User, profile_in: Optional[profile_schema.ProfileCreate] = None) -> profile_model.Profile:
    """
    Crée un profil pour un utilisateur, potentiellement avec des données initiales.
    Appelé typiquement après la création d'un utilisateur.
    """
    profile_data = profile_in.dict(exclude_unset=True) if profile_in else {}
    db_profile = profile_model.Profile(
        user_id=user.id,
        **profile_data
    )
    # Valeurs par défaut si non fournies et si le modèle le permet
    if not db_profile.bio and hasattr(profile_model.Profile, 'bio'):
        db_profile.bio = ""
    if not db_profile.profile_picture_url and hasattr(profile_model.Profile, 'profile_picture_url'):
        db_profile.profile_picture_url = None # Ou une URL par défaut
    if not db_profile.disc_type and hasattr(profile_model.Profile, 'disc_type'):
        db_profile.disc_type = None
    if not db_profile.disc_assessment_results and hasattr(profile_model.Profile, 'disc_assessment_results'):
        db_profile.disc_assessment_results = {}
    if not db_profile.interests and hasattr(profile_model.Profile, 'interests'):
        db_profile.interests = []
    if not db_profile.skills and hasattr(profile_model.Profile, 'skills'):
        db_profile.skills = []
        
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def update_profile(db: Session, user_id: int, profile_update: profile_schema.ProfileUpdate) -> Optional[profile_model.Profile]:
    db_profile = get_profile_by_user_id(db, user_id=user_id)
    if not db_profile:
        return None

    update_data = profile_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)

    db.commit()
    db.refresh(db_profile)
    return db_profile

# Pas de fonction delete_profile ici, car un profil est intrinsèquement lié à un utilisateur.
# La suppression d'un utilisateur devrait entraîner la suppression en cascade de son profil (via la configuration de la BD ou explicitement).
