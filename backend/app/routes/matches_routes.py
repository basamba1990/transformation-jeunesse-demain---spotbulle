# backend/app/routes/matches_routes_compatible.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Annotated
import logging
from pydantic import BaseModel

from ..schemas import user_schema
from ..utils import security
from ..database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/matches",
    tags=["Matches"],
    responses={404: {"description": "Non trouvé"}}
)

# ===== MODÈLES POUR COMPATIBILITÉ FRONTEND =====

class MatchedUser(BaseModel):
    id: int
    name: str
    bio: str
    compatibility: int
    avatar: str

class MatchResponse(BaseModel):
    id: str
    user_id: int
    matched_user: MatchedUser
    status: str
    created_at: str

# ===== ROUTES COMPATIBLES FRONTEND =====

@router.get(
    "",
    response_model=List[MatchResponse],
    summary="Récupérer mes matches"
)
async def get_matches(
    db: Session = Depends(get_db),
    current_user: Annotated[user_schema.User, Depends(security.get_current_active_user)]
):
    """Récupération des matches de l'utilisateur"""
    try:
        # TODO: Implémenter la logique réelle de matching
        # Pour l'instant, retourne une liste vide
        # En production, ceci devrait interroger la base de données
        # et retourner les vrais matches de l'utilisateur
        
        return []
        
    except Exception as e:
        logger.error(f"Erreur récupération matches: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des matches"
        )

@router.post(
    "/{match_id}/accept",
    response_model=MatchResponse,
    summary="Accepter un match"
)
async def accept_match(
    match_id: str,
    db: Session = Depends(get_db),
    current_user: Annotated[user_schema.User, Depends(security.get_current_active_user)]
):
    """Accepter un match"""
    try:
        # TODO: Implémenter la logique réelle d'acceptation de match
        # Pour l'instant, retourne une erreur indiquant que la fonctionnalité n'est pas implémentée
        
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Fonctionnalité d'acceptation de match non encore implémentée"
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erreur acceptation match: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'acceptation du match"
        )

@router.post(
    "/{match_id}/reject",
    response_model=MatchResponse,
    summary="Refuser un match"
)
async def reject_match(
    match_id: str,
    db: Session = Depends(get_db),
    current_user: Annotated[user_schema.User, Depends(security.get_current_active_user)]
):
    """Refuser un match"""
    try:
        # TODO: Implémenter la logique réelle de refus de match
        # Pour l'instant, retourne une erreur indiquant que la fonctionnalité n'est pas implémentée
        
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Fonctionnalité de refus de match non encore implémentée"
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erreur refus match: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors du refus du match"
        )

