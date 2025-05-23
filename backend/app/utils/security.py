from datetime import datetime, timedelta
from typing import Annotated, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

# Import absolu du modèle User
from .models.user_model import User
from .config import settings
from .database import get_db
from .services import user_service
from .schemas import user_schema, token_schema

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# Modification de la signature avec le modèle importé
def create_tokens(user: User) -> token_schema.Token:
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "is_superuser": user.is_superuser},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    refresh_token = create_refresh_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    return token_schema.Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)
) -> user_schema.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            raise credentials_exception
            
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
            
        user = user_service.get_user_by_email(db, email)
        if user is None:
            raise credentials_exception
            
        return user_schema.User.model_validate(user)
        
    except JWTError as e:
        raise credentials_exception

async def get_current_active_user(
    current_user: Annotated[user_schema.User, Depends(get_current_user)]
) -> user_schema.User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user

def validate_refresh_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_exp": True}
        )
        if payload.get("type") != "refresh":
            raise JWTError("Invalid token type")
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid refresh token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )
