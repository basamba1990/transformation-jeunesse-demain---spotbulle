# backend/app/routes/auth_routes.py

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..schemas import token_schema, user_schema
from ..services import user_service
from ..utils import security
from ..database import get_db
from ..config import settings

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
    user = user_service.get_user_by_email(db, email=form_data.username)
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte utilisateur désactivé"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "is_superuser": user.is_superuser
        },
        expires_delta=access_token_expires
    )
    
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
        new_user = user_service.create_user(db=db, user=user)
        return new_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du compte"
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
