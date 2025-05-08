# Routes pour l'authentification (login, etc.)

from fastapi import APIRouter, Depends, HTTPException, status, Request # Ajout de Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ..schemas import token_schema, user_schema # Schémas Pydantic
from ..services import user_service # Services CRUD pour les utilisateurs
from ..utils import security # Utilitaires de sécurité (JWT, hachage)
from ..database import get_db # Dépendance pour la session DB
from ..config import ACCESS_TOKEN_EXPIRE_MINUTES

# Importer le limiteur global de main.py ou en créer un spécifique ici
# Pour cet exemple, nous allons supposer que le limiteur est accessible via l'état de l'application
# ou nous en créons un nouveau spécifique à ces routes critiques.
from slowapi import Limiter
from slowapi.util import get_remote_address

# Limiteur spécifique pour les routes d'authentification, plus strict
auth_limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

@router.post("/token", response_model=token_schema.Token)
@auth_limiter.limit("5/minute") # Limite à 5 tentatives par minute par IP
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_service.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please try again.", # Message légèrement plus générique
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user. Please contact support."
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "user_id": user.id, "is_superuser": user.is_superuser}, # Ajout de user_id et is_superuser au token
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=user_schema.User)
@auth_limiter.limit("10/hour") # Limite à 10 inscriptions par heure par IP
def register_user(request: Request, user: user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered. Please try logging in or use a different email.")
    
    # Vérification de la complexité du mot de passe (déjà gérée par Pydantic Field, mais une double vérification peut être ajoutée si nécessaire)
    # if not security.is_password_strong_enough(user.password):
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password is not strong enough.")

    return user_service.create_user(db=db, user=user)

@router.get("/users/me", response_model=user_schema.User)
async def read_users_me(current_user: user_schema.User = Depends(security.get_current_active_user)):
    """
    Récupère l'utilisateur actuellement authentifié.
    """
    # Les informations retournées sont déjà filtrées par le schéma user_schema.User
    return current_user

