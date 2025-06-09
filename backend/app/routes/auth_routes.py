# backend/app/routes/auth_routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address
import logging
from typing import Annotated
from pydantic import BaseModel

from ..schemas import token_schema, user_schema
from ..services import user_service
from ..utils import security
from ..database import get_db
from ..config import settings

logger = logging.getLogger("auth_routes")
logger.setLevel(logging.INFO)

auth_limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Non trouvé"}}
)

# ===== MODÈLES POUR COMPATIBILITÉ FRONTEND =====

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

# ===== ROUTE COMPATIBLE FRONTEND =====

@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Connexion utilisateur (compatible frontend)"
)
@auth_limiter.limit("5/minute")
async def login_frontend_compatible(
    request: Request,
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """Authentification compatible avec le frontend SpotBulle"""
    try:
        # Utilisateur de test
        test_email = "basamba2050@spotbulle.com"
        test_password = "Phys@1990"
        
        if credentials.username == test_email and credentials.password == test_password:
            # Token de démo
            access_token = "demo_token_spotbulle_2024"
            
            return LoginResponse(
                access_token=access_token,
                refresh_token="demo_refresh_token",
                token_type="bearer",
                user={
                    "id": 1,
                    "email": test_email,
                    "full_name": "Basamba Spotbulle",
                    "bio": "Passionné de développement personnel",
                    "avatar": None,
                    "is_active": True,
                    "is_superuser": False,
                    "created_at": "2024-01-01T00:00:00Z"
                }
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants incorrects",
                headers={"WWW-Authenticate": "Bearer"},
            )

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erreur de connexion frontend: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur interne d'authentification"
        )

@router.post(
    "/token",
    response_model=token_schema.Token,
    summary="Connexion utilisateur (OAuth2)"
)
@auth_limiter.limit("5/minute")
async def login_for_access_token(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    """Authentification avec email/mot de passe (OAuth2 standard)"""
    try:
        user = user_service.authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Identifiants incorrects",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return security.create_tokens_response(user)
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erreur de connexion: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur interne d'authentification"
        )

@router.post(
    "/refresh",
    response_model=token_schema.Token,
    summary="Rafraîchir le token"
)
@auth_limiter.limit("20/minute")
async def refresh_access_token(
    request: Request,
    refresh_token_data: token_schema.RefreshToken,
    db: Session = Depends(get_db)
):
    """Rafraîchissement de token JWT"""
    try:
        user = security.validate_refresh_token(db, refresh_token_data.refresh_token)
        return security.create_tokens_response(user)
    
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erreur rafraîchissement token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Impossible de rafraîchir le token"
        )

@router.post(
    "/register",
    response_model=user_schema.User,
    summary="Création de compte"
)
@auth_limiter.limit("10/hour")
async def register_user(
    request: Request,
    user_data: user_schema.UserCreate,
    db: Session = Depends(get_db)
):
    """Enregistrement nouveau utilisateur"""
    try:
        db_user = user_service.get_user_by_email(db, user_data.email)
        if db_user:
            logger.warning(f"Tentative d'inscription avec un email déjà utilisé: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email déjà enregistré"
            )

        created_user = user_service.create_user(db, user_data)
        logger.info(f"Nouvel utilisateur créé avec succès: {created_user.email}")
        return user_schema.User.model_validate(created_user)

    except ValueError as ve:
        logger.error(f"Erreur de validation lors de la création du compte: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur création compte: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création du compte: {str(e)}"
        )
    finally:
        db.close()

@router.get(
    "/me",
    response_model=user_schema.User,
    summary="Profil utilisateur"
)
async def get_current_user(
    current_user: Annotated[user_schema.User, Depends(security.get_current_active_user)]
):
    """Récupération profil utilisateur"""
    return current_user

