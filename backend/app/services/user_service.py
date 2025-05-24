from sqlalchemy.orm import Session
from typing import Optional, List
from sqlalchemy.exc import IntegrityError
import logging

# Import absolu du modèle
from ..models.user_model import User
from ..schemas import user_schema
from ..utils import security

logger = logging.getLogger("user_service")
logger.setLevel(logging.INFO)

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

# Modification des annotations de type
def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: user_schema.UserCreate) -> User:
    try:
        hashed_password = security.get_password_hash(user.password)
        db_user = User(
            email=user.email,
            hashed_password=hashed_password,
            full_name=user.full_name,
            is_active=True,
            is_superuser=False
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"Utilisateur créé avec succès: {user.email}")
        return db_user
    except IntegrityError as e:
        db.rollback()
        # Log détaillé de l'erreur
        logger.error(f"Erreur d'intégrité lors de la création de l'utilisateur: {str(e)}")
        # Vérifier si c'est une violation de contrainte d'unicité sur l'email
        if "unique constraint" in str(e).lower() and "email" in str(e).lower():
            raise ValueError("Cet email est déjà utilisé")
        raise ValueError(f"Erreur d'intégrité de données: {str(e)}")
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur inattendue lors de la création de l'utilisateur: {str(e)}", exc_info=True)
        raise ValueError(f"Erreur lors de la création de l'utilisateur: {str(e)}")

def update_user(db: Session, user_id: int, user_update: user_schema.UserUpdate) -> Optional[User]:
    try:
        db_user = get_user(db, user_id)
        if not db_user:
            return None

        update_data = user_update.model_dump(exclude_unset=True)
        
        if "password" in update_data and update_data["password"]:
            hashed_password = security.get_password_hash(update_data["password"])
            db_user.hashed_password = hashed_password
            del update_data["password"]

        for key, value in update_data.items():
            if hasattr(db_user, key):
                setattr(db_user, key, value)

        db.commit()
        db.refresh(db_user)
        logger.info(f"Utilisateur mis à jour avec succès: ID {user_id}")
        return db_user
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Erreur d'intégrité lors de la mise à jour de l'utilisateur: {str(e)}")
        if "unique constraint" in str(e).lower() and "email" in str(e).lower():
            raise ValueError("Cet email est déjà utilisé par un autre compte")
        raise ValueError(f"Erreur d'intégrité de données: {str(e)}")
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur inattendue lors de la mise à jour de l'utilisateur: {str(e)}", exc_info=True)
        raise ValueError(f"Erreur lors de la mise à jour de l'utilisateur: {str(e)}")

def delete_user(db: Session, user_id: int) -> Optional[User]:
    try:
        db_user = get_user(db, user_id)
        if not db_user:
            return None
        db.delete(db_user)
        db.commit()
        logger.info(f"Utilisateur supprimé avec succès: ID {user_id}")
        return db_user
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur lors de la suppression de l'utilisateur: {str(e)}", exc_info=True)
        raise ValueError(f"Erreur lors de la suppression de l'utilisateur: {str(e)}")

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user or not security.verify_password(password, user.hashed_password):
        return None
    return user
