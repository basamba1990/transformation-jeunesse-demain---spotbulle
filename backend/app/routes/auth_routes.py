# backend/app/routes/auth_routes.py

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address
import logging

from ..schemas import token_schema, user_schema
from ..services import user_service
from ..utils import security
from ..database import get_db
from ..config import settings

# Configuration du logger
logger = logging.getLogger("auth_routes")
logger.setLevel(logging.INFO)

# Limiteur local spécifique aux routes d'authentification
auth_limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Non trouvé"}}
)

@router.post(
    "/token",
    response_model=token_schema.Token,
    summary="Connexion utilisateur",
    description="Authentifie un utilisateur et retourne un token JWT"
)
@auth_limiter.limit("5/minute")
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authentifie un utilisateur avec email/mot de passe et retourne un token JWT
    """
    # Logs détaillés pour le débogage
    logger.info(f"Tentative de connexion pour l'email: {form_data.username}")
    
    user = user_service.get_user_by_email(db, email=form_data.username)
    
    if not user:
        logger.warning(f"Échec de connexion: Utilisateur non trouvé pour l'email {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects (utilisateur non trouvé)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    logger.info(f"Utilisateur trouvé, vérification du mot de passe pour {form_data.username}")
    
    if not security.verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Échec de connexion: Mot de passe incorrect pour {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects (mot de passe invalide)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        logger.warning(f"Échec de connexion: Compte désactivé pour {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte utilisateur désactivé"
        )

    logger.info(f"Connexion réussie pour {form_data.username}, génération du token")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "is_superuser": user.is_superuser
        },
        expires_delta=access_token_expires
    )
    
    logger.info(f"Token généré avec succès pour {form_data.username}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "is_superuser": user.is_superuser
    }

@router.post(
    "/register",
    response_model=user_schema.User,
    summary="Création de compte",
    description="Enregistre un nouvel utilisateur dans le système"
)
@auth_limiter.limit("10/hour")
def register_user(
    request: Request,
    user: user_schema.UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = user_service.get_user_by_email(db, email=user.email)
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email déjà enregistré"
        )

    try:
        # user_service.create_user retourne probablement un objet ORM (modèle SQLAlchemy)
        created_user_orm = user_service.create_user(db=db, user=user)
        
        # CORRECTION : Utiliser from_orm au lieu de model_validate pour Pydantic v1
        return user_schema.User.from_orm(created_user_orm)
    
    except HTTPException as http_exc: # Rediffuser les exceptions HTTP déjà gérées
        raise http_exc
    except Exception as e:
        db.rollback()
        print(f"Erreur détaillée lors de la création du compte: {e}") # Log de l'erreur détaillée
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne lors de la création du compte: {str(e)}" # Inclure le message d'erreur
        )

@router.get(
    "/me",
    response_model=user_schema.User,
    summary="Profil utilisateur",
    description="Récupère les informations de l'utilisateur connecté"
)
async def get_current_user(
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    """
    Retourne les données du compte de l'utilisateur authentifié
    """
    return current_user
