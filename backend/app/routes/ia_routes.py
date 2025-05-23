# Routes pour les fonctionnalités IA (matching, bot, etc.)

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List, Any, Dict

from .services import ia_service
from .schemas import user_schema, ia_schema # Ajout de ia_schema pour les réponses structurées
from .utils import security # Changement de l_import pour get_current_active_user
from .database import get_db # Changement de l_import pour get_db

from slowapi import Limiter
from slowapi.util import get_remote_address

ia_router_limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="",
    tags=["IA"], # Tag en majuscule pour la cohérence
    dependencies=[Depends(security.get_current_active_user)], # Sécurise toutes les routes de ce routeur
    responses={404: {"description": "Not found"}}
)

@router.get("/matches", response_model=List[ia_schema.MatchResult]) # Utiliser un schéma de réponse défini
@ia_router_limiter.limit("20/minute") # Limite pour les demandes de matching
async def get_user_matches(
    request: Request,
    current_user: user_schema.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db),
    limit: int = 10,
    use_openai_embeddings: bool = False 
):
    """
    Récupère les recommandations de matching IA pour l_utilisateur courant.
    Limite le nombre de résultats et permet de choisir la source d_embedding.
    """
    if limit > 50: # Plafonner la limite pour éviter les abus
        limit = 50
    
    matches = await ia_service.find_ia_matches(
        db=db, 
        user_id=current_user.id, 
        limit=limit,
        use_openai_embeddings=use_openai_embeddings
    )
    
    if not matches:
        return [] # Retourner une liste vide si aucun match n_est trouvé
        
    # Assurer que la réponse est conforme au schéma ia_schema.MatchResult
    # Cela peut nécessiter une transformation dans ia_service ou ici.
    # Pour l_instant, on suppose que ia_service.find_ia_matches retourne une liste de dicts compatibles.
    return matches

@router.post("/bot/chat", response_model=ia_schema.ChatResponse) # Utiliser un schéma de réponse défini
@ia_router_limiter.limit("30/minute") # Limite pour les interactions avec le bot
async def chat_with_ia_bot(
    request: Request,
    prompt_data: user_schema.UserPrompt, # UserPrompt a déjà des validations de longueur
    current_user: user_schema.User = Depends(security.get_current_active_user),
    # db: Session = Depends(get_db) # Décommenter si le bot a besoin d_accéder à la DB
):
    """
    Permet à l_utilisateur d_interagir avec le bot IA.
    Le prompt est validé par le schéma UserPrompt.
    """
    try:
        response_content = await ia_service.get_ia_bot_response(prompt=prompt_data.prompt, user_id=current_user.id)
        if not response_content or not response_content.get("response"):
             raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="IA service did not return a valid response. Please try again later.")
        return ia_schema.ChatResponse(response=response_content.get("response"))
    except HTTPException as e:
        raise e # Retransmettre les exceptions HTTP spécifiques
    except Exception as e:
        print(f"Error during IA bot chat for user {current_user.id}: {e}") # Log serveur
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred with the IA bot. Please try again later.")

# Créer le fichier ia_schema.py s_il n_existe pas
# Contenu pour /home/ubuntu/analysis_spotbulle_v2/home/ubuntu/spotbulle-mvp/backend/app/schemas/ia_schema.py:
# from pydantic import BaseModel, Field
# from typing import List, Dict, Any, Optional

# class StrictBaseModel(BaseModel):
#     class Config:
#         extra = "forbid"
#         orm_mode = True

# class MatchResult(StrictBaseModel):
#     matched_user_id: Optional[int] = None
#     matched_pod_id: Optional[int] = None
#     score: float = Field(..., ge=0, le=1)
#     reason: Optional[str] = Field(None, max_length=500)
#     # Ajouter d_autres champs pertinents pour un match

# class ChatResponse(StrictBaseModel):
#     response: str = Field(..., min_length=1)
#     # Ajouter d_autres champs si la réponse du bot est plus structurée
