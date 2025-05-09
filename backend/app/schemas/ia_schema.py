# Schemas Pydantic pour les fonctionnalités IA

from pydantic import BaseModel, Field
from pydantic.config import ConfigDict  # <- Ajout important pour Pydantic v2
from typing import List, Dict, Any, Optional

# Base stricte interdisant les champs inattendus et activant la compatibilité ORM
class StrictBaseModel(BaseModel):
    model_config = ConfigDict(
        extra="forbid",              # Empêche l'ajout de champs non définis
        from_attributes=True         # Remplace orm_mode=True en Pydantic v2
    )

# Schéma de résultat de correspondance IA (matching entre utilisateurs ou pods)
class MatchResult(StrictBaseModel):
    matched_user_id: Optional[int] = None
    matched_pod_id: Optional[int] = None
    score: float = Field(..., ge=0, le=1, description="Score de similarité du match, entre 0 et 1.")
    reason: Optional[str] = Field(None, max_length=500, description="Explication ou justification du match.")
    # Exemple d'autres champs qui pourraient être pertinents pour un match :
    # matched_item_type: Literal["user", "pod"]
    # matched_item_title: Optional[str] = None  # Titre du pod ou nom de l'utilisateur matché
    # common_interests: Optional[List[str]] = None

# Schéma de réponse du chatbot IA
class ChatResponse(StrictBaseModel):
    response: str = Field(..., min_length=1, description="Réponse textuelle du bot IA.")
    # On pourrait ajouter d'autres champs si la réponse du bot est plus structurée,
    # par exemple des actions suggérées, des sources d'information, etc.
    # session_id: Optional[str] = None  # Pour suivre une conversation
    # suggested_actions: Optional[List[Dict[str, Any]]] = None
