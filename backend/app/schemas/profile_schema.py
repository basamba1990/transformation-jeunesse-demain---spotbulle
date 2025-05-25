# Schémas Pydantic pour l'entité Profil Utilisateur

from pydantic import BaseModel, Field, HttpUrl, validator, ConfigDict
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime

# Configuration globale pour interdire les champs supplémentaires non définis dans les modèles
class StrictBaseModel(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

# Types DISC possibles
DISCType = Literal["Dominant", "Influent", "Stable", "Conforme", "Unknown"]

# Schéma de base pour un profil
class ProfileBase(StrictBaseModel):
    bio: Optional[str] = Field(None, max_length=2000, description="Biographie de l'utilisateur.")
    profile_picture_url: Optional[HttpUrl] = Field(None, description="URL de l'image de profil.")
    interests: Optional[List[str]] = Field(None, max_items=30, description="Liste des centres d'intérêt, maximum 30.")
    skills: Optional[List[str]] = Field(None, max_items=30, description="Liste des compétences, maximum 30.")
    objectives: Optional[str] = Field(None, max_length=1000, description="Objectifs de l'utilisateur sur la plateforme.")
    # disc_type et disc_assessment_results sont généralement définis par le service DISC, non modifiables directement par l'utilisateur ici.

# Schéma pour la création d'un profil (généralement vide ou avec peu de champs, car le profil est créé avec l'utilisateur)
class ProfileCreate(ProfileBase):
    # Souvent, un profil est créé vide ou avec des valeurs par défaut lors de la création de l'utilisateur.
    # Les champs sont donc optionnels ici.
    bio: Optional[str] = Field(None, max_length=2000)
    profile_picture_url: Optional[HttpUrl] = None
    interests: Optional[List[str]] = Field(None, max_items=30)
    skills: Optional[List[str]] = Field(None, max_items=30)
    objectives: Optional[str] = Field(None, max_length=1000)

# Schéma pour la mise à jour d'un profil par l'utilisateur
class ProfileUpdate(StrictBaseModel):
    bio: Optional[str] = Field(None, max_length=2000)
    profile_picture_url: Optional[HttpUrl] = None  # L'upload d'image serait une route séparée qui met à jour ce champ
    interests: Optional[List[str]] = Field(None, max_items=30)
    skills: Optional[List[str]] = Field(None, max_items=30)
    objectives: Optional[str] = Field(None, max_length=1000)

    # Validateurs pour s'assurer que les listes sont bien des listes de strings
    @validator("interests", "skills", pre=True, always=True)
    def ensure_list_of_strings(cls, v, field):
        if v is None:
            return []
        if isinstance(v, str):
            # Convertir une chaîne séparée par des virgules en liste
            return [item.strip() for item in v.split(",") if item.strip()]
        if isinstance(v, list):
            # S'assurer que tous les éléments sont des strings et non vides après strip
            return [str(item).strip() for item in v if str(item).strip()]
        raise ValueError(f"{field.name} doit être une liste de chaînes de caractères ou une chaîne séparée par des virgules.")

# Schéma pour lire un profil (ce qui est retourné par l'API)
class Profile(ProfileBase):
    id: int
    user_id: int
    disc_type: Optional[DISCType] = Field(None, description="Type de profil DISC de l'utilisateur.")
    disc_assessment_results: Optional[Dict[str, Any]] = Field(None, description="Résultats détaillés de l'évaluation DISC.")
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Schéma pour les réponses au questionnaire DISC
class DiscAnswer(StrictBaseModel):
    question_id: int
    selected_option: str  # ou int, selon la conception du questionnaire

class DiscAssessmentSubmission(StrictBaseModel):
    answers: List[DiscAnswer] = Field(..., min_items=1, description="Liste des réponses au questionnaire DISC.")

# Schéma pour les résultats DISC (simplifié, à adapter)
class DISCScores(StrictBaseModel):
    D: int = Field(..., ge=0, le=100)
    I: int = Field(..., ge=0, le=100)
    S: int = Field(..., ge=0, le=100)
    C: int = Field(..., ge=0, le=100)

class DISCResults(StrictBaseModel):
    disc_type: DISCType
    scores: DISCScores
    summary: Optional[str] = None
    detailed_report_url: Optional[HttpUrl] = None  # Si un rapport plus détaillé est généré
    
    model_config = ConfigDict(from_attributes=True)
