# Schémas Pydantic pour l'entité Pod

from pydantic import BaseModel, Field, HttpUrl, ConfigDict, validator
from typing import Optional, List
from datetime import datetime

# Configuration globale pour interdire les champs supplémentaires non définis dans les modèles
class StrictBaseModel(BaseModel):
    model_config = ConfigDict(
        extra="forbid",             # Empêche les champs non définis
        from_attributes=True        # Remplace orm_mode = True en Pydantic v2
    )
    
    # Ajout de la classe Config pour compatibilité Pydantic v1
    class Config:
        orm_mode = True

# Schéma de base pour un pod
class PodBase(StrictBaseModel):
    title: str = Field(..., min_length=3, max_length=150, description="Le titre du pod.")
    description: Optional[str] = Field(None, max_length=5000, description="Description détaillée du pod.")
    tags: Optional[List[str]] = Field(None, max_items=20, description="Liste de tags, maximum 20 tags.")
    # Chaque tag individuel pourrait aussi avoir une validation de longueur si nécessaire
    # Exemple: tags: Optional[List[constr(min_length=2, max_length=25)]] = Field(None, max_items=20)

# Schéma pour la création d'un pod
class PodCreate(PodBase):
    # L'URL du fichier audio et la transcription sont gérées par des services après la création initiale
    # ou lors de la mise à jour, donc pas directement ici à la création de l'objet de base.
    pass

# Schéma pour la mise à jour d'un pod
class PodUpdate(StrictBaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    description: Optional[str] = Field(None, max_length=5000)
    tags: Optional[List[str]] = Field(None, max_items=20)
    # audio_file_url: Optional[HttpUrl] = None # Si l'URL peut être mise à jour directement (généralement non)
    # transcription: Optional[str] = None # Généralement mis à jour par un service dédié

# Schéma pour lire un pod (ce qui est retourné par l'API)
class Pod(PodBase):
    id: int
    user_id: int  # Renommé owner_id en user_id pour cohérence avec user_model
    audio_file_url: Optional[HttpUrl] = None
    transcription: Optional[str] = Field(None, description="Transcription du contenu audio.")
    created_at: datetime
    updated_at: datetime
    
    # Ajout explicite de la classe Config pour compatibilité Pydantic v1
    class Config:
        orm_mode = True

    # Pour s'assurer que les tags sont bien une liste de strings si fournis
    @validator("tags", pre=True, always=True)
    def ensure_tags_is_list(cls, v):
        if v is None:
            return []
        if isinstance(v, str):
            return [tag.strip() for tag in v.split(",") if tag.strip()]
        if isinstance(v, list):
            # S'assurer que tous les éléments sont des strings et non vides après strip
            return [str(tag).strip() for tag in v if str(tag).strip()]
        raise ValueError("Les tags doivent être une liste de chaînes de caractères ou une chaîne séparée par des virgules.")
