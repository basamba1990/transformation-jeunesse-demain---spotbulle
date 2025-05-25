from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

# --------------------------------------------------
# Configuration par défaut
# --------------------------------------------------
default_config = ConfigDict(
    from_attributes=True,
    extra="forbid",
    json_encoders={datetime: lambda v: v.isoformat()}
)

# --------------------------------------------------
# Schémas Utilisateur
# --------------------------------------------------

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)

    model_config = default_config


class UserCreate(UserBase):
    password: str = Field(
        ..., 
        min_length=8, 
        max_length=128,
        description="Mot de passe fort requis"
    )
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)

    model_config = default_config


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    password: Optional[str] = Field(None, min_length=8, max_length=128)

    model_config = default_config


class UserUpdateByAdmin(UserUpdate):
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None

    model_config = default_config


class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime

    model_config = default_config

# --------------------------------------------------
# Schéma pour la communication IA (Prompt)
# --------------------------------------------------

class UserPrompt(BaseModel):
    prompt_text: str = Field(
        ..., 
        min_length=1, 
        max_length=1000,
        description="Entrée utilisateur pour le traitement IA",
        json_schema_extra={
            "example": {
                "prompt_text": "Comment développer mon projet professionnel ?"
            }
        }
    )

    model_config = default_config
