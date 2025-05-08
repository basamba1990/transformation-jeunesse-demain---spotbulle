# Schemas Pydantic pour les fonctionnalités IA

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class StrictBaseModel(BaseModel):
    class Config:
        extra = "forbid"
        orm_mode = True

class MatchResult(StrictBaseModel):
    matched_user_id: Optional[int] = None
    matched_pod_id: Optional[int] = None
    score: float = Field(..., ge=0, le=1, description="Score de similarité du match, entre 0 et 1.")
    reason: Optional[str] = Field(None, max_length=500, description="Explication ou justification du match.")
    # Exemple d_autres champs qui pourraient être pertinents pour un match:
    # matched_item_type: Literal["user", "pod"]
    # matched_item_title: Optional[str] = None # Titre du pod ou nom de l_utilisateur matché
    # common_interests: Optional[List[str]] = None

class ChatResponse(StrictBaseModel):
    response: str = Field(..., min_length=1, description="Réponse textuelle du bot IA.")
    # On pourrait ajouter d_autres champs si la réponse du bot est plus structurée, 
    # par exemple des actions suggérées, des sources d_information, etc.
    # session_id: Optional[str] = None # Pour suivre une conversation
    # suggested_actions: Optional[List[Dict[str, Any]]] = None

