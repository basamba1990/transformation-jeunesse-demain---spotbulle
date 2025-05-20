# Schémas Pydantic pour les tokens JWT

from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user_id: Optional[int] = None
    is_superuser: Optional[bool] = None

class TokenData(BaseModel):
    email: Optional[str] = None

class RefreshToken(BaseModel):
    refresh_token: str
