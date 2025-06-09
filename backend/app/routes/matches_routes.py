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
        # Données de démo pour les matches
        demo_matches = [
            {
                "id": "match-1",
                "user_id": current_user.id,
                "matched_user": {
                    "id": 2,
                    "name": "Sophie Martin",
                    "bio": "Coach en développement personnel",
                    "compatibility": 92,
                    "avatar": "/static/avatars/sophie.jpg"
                },
                "status": "pending",
                "created_at": "2024-06-09T08:00:00Z"
            },
            {
                "id": "match-2",
                "user_id": current_user.id,
                "matched_user": {
                    "id": 3,
                    "name": "Thomas Dubois",
                    "bio": "Entrepreneur passionné",
                    "compatibility": 87,
                    "avatar": "/static/avatars/thomas.jpg"
                },
                "status": "accepted",
                "created_at": "2024-06-08T15:30:00Z"
            },
            {
                "id": "match-3",
                "user_id": current_user.id,
                "matched_user": {
                    "id": 4,
                    "name": "Marie Leroy",
                    "bio": "Artiste et créatrice",
                    "compatibility": 85,
                    "avatar": "/static/avatars/marie.jpg"
                },
                "status": "pending",
                "created_at": "2024-06-07T11:20:00Z"
            }
        ]
        
        return [MatchResponse(**match) for match in demo_matches]
        
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
        # Simulation de l'acceptation
        accepted_match = {
            "id": match_id,
            "user_id": current_user.id,
            "matched_user": {
                "id": 2,
                "name": "Sophie Martin",
                "bio": "Coach en développement personnel",
                "compatibility": 92,
                "avatar": "/static/avatars/sophie.jpg"
            },
            "status": "accepted",
            "created_at": "2024-06-09T08:00:00Z"
        }
        
        return MatchResponse(**accepted_match)
        
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
        # Simulation du refus
        rejected_match = {
            "id": match_id,
            "user_id": current_user.id,
            "matched_user": {
                "id": 2,
                "name": "Sophie Martin",
                "bio": "Coach en développement personnel",
                "compatibility": 92,
                "avatar": "/static/avatars/sophie.jpg"
            },
            "status": "rejected",
            "created_at": "2024-06-09T08:00:00Z"
        }
        
        return MatchResponse(**rejected_match)
        
    except Exception as e:
        logger.error(f"Erreur refus match: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors du refus du match"
        )

