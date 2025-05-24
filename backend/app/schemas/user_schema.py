from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# --------------------------------------------------
# Schémas Utilisateur
# --------------------------------------------------

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    
    class Config:
        extra = "forbid"
        orm_mode = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class UserCreate(UserBase):
    password: str = Field(..., 
        min_length=8, 
        max_length=128,
        description="Mot de passe fort requis"
    )
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    password: Optional[str] = Field(None, min_length=8, max_length=128)
    
    class Config:
        extra = "forbid"
        orm_mode = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class UserUpdateByAdmin(UserUpdate):
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime

# --------------------------------------------------
# Schémas IA
# --------------------------------------------------

class UserPrompt(BaseModel):
    prompt_text: str = Field(
        ..., 
        min_length=1, 
        max_length=1000,
        description="Entrée utilisateur pour le traitement IA",
        json_schema_extra={"example": {"prompt_text": "Comment développer mon projet professionnel ?"}}
    )
    
    class Config:
        extra = "forbid"
        orm_mode = True
        json_encoders = {datetime: lambda v: v.isoformat()}
