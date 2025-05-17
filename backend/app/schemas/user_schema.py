# Schémas Pydantic pour l'entité Utilisateur

from pydantic import BaseModel, EmailStr, Field
from pydantic.config import ConfigDict
from typing import Optional
from datetime import datetime

# Configuration globale pour interdire les champs supplémentaires non définis dans les modèles
class StrictBaseModel(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

# Schéma de base pour l'utilisateur (attributs partagés)
class UserBase(StrictBaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)

# Schéma pour la création d'un utilisateur (hérite de UserBase)
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128, description="Le mot de passe doit contenir au moins 8 caractères.")
    # Le full_name devient obligatoire à la création
    full_name: str = Field(..., min_length=2, max_length=100)

# Schéma pour la mise à jour d'un utilisateur par l'utilisateur lui-même
# L'utilisateur ne devrait pas pouvoir changer son statut is_active ou is_superuser directement
class UserUpdate(StrictBaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    password: Optional[str] = Field(None, min_length=8, max_length=128, description="Le nouveau mot de passe doit contenir au moins 8 caractères.")

# Schéma pour la mise à jour d'un utilisateur par un administrateur (plus de champs)
class UserUpdateByAdmin(UserUpdate):
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None

# Schéma pour lire un utilisateur (ce qui est retourné par l'API, sans le mot de passe)
class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True  # Configuration pour Pydantic v1
        from_attributes = True  # Pour compatibilité future avec Pydantic v2

# Schéma pour le prompt utilisateur (utilisé par le bot IA)
class UserPrompt(StrictBaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000) # Limiter la taille du prompt
