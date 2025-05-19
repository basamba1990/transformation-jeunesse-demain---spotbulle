# Routes pour la gestion des profils utilisateurs et du DISC

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from typing import List, Dict, Any 

from ..schemas import profile_schema, user_schema, disc_schema 
from ..services import profile_service, user_service, disc_service 
from ..utils import security
from ..database import get_db

from slowapi import Limiter
from slowapi.util import get_remote_address

profile_router_limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/profiles",
    tags=["Profiles & DISC"],
    dependencies=[Depends(security.get_current_active_user)]
)

@router.get("/me", response_model=profile_schema.Profile)
@profile_router_limiter.limit("30/minute")
async def read_my_profile(
    request: Request,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    profile = profile_service.get_profile_by_user_id(db, user_id=current_user.id)
    if not profile:
        # Tentative de création de profil si inexistant pour l'utilisateur courant
        profile = profile_service.create_user_profile(db, user=current_user, profile_in=profile_schema.ProfileCreate())
        if not profile:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create or retrieve profile for user.")
    
    # Correction: Convertir explicitement l'objet SQLAlchemy en dictionnaire compatible avec le schéma Pydantic
    profile_dict = {
        "id": profile.id,
        "user_id": profile.user_id,
        "bio": profile.bio or "",
        "profile_picture_url": profile.profile_picture_url,
        "disc_type": profile.disc_type,
        "disc_assessment_results": profile.disc_assessment_results or {},
        "interests": profile.interests or [],
        "skills": profile.skills or [],
        "objectives": profile.objectives if hasattr(profile, "objectives") else None,
        "updated_at": profile.updated_at
    }
    
    # Retourner un dictionnaire conforme au schéma Pydantic
    return profile_dict

@router.put("/me", response_model=profile_schema.Profile)
@profile_router_limiter.limit("15/minute")
async def update_my_profile(
    request: Request,
    profile_update: profile_schema.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    # S'assurer que le profil existe avant de tenter la mise à jour
    existing_profile = profile_service.get_profile_by_user_id(db, user_id=current_user.id)
    if not existing_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found. Cannot update a non-existing profile.")

    updated_profile = profile_service.update_profile(db, user_id=current_user.id, profile_update=profile_update)
    if updated_profile is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update profile. Please try again later.")
    
    # Correction: Convertir explicitement l'objet SQLAlchemy en dictionnaire compatible avec le schéma Pydantic
    profile_dict = {
        "id": updated_profile.id,
        "user_id": updated_profile.user_id,
        "bio": updated_profile.bio or "",
        "profile_picture_url": updated_profile.profile_picture_url,
        "disc_type": updated_profile.disc_type,
        "disc_assessment_results": updated_profile.disc_assessment_results or {},
        "interests": updated_profile.interests or [],
        "skills": updated_profile.skills or [],
        "objectives": updated_profile.objectives if hasattr(updated_profile, "objectives") else None,
        "updated_at": updated_profile.updated_at
    }
    
    return profile_dict

@router.get("/{user_id}", response_model=profile_schema.Profile)
@profile_router_limiter.limit("30/minute")
async def read_user_profile_by_id(
    request: Request,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    target_user = user_service.get_user(db, user_id=user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found.")

    # Seul un superutilisateur peut voir le profil d'un autre utilisateur
    if user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's profile."
        )
    
    profile = profile_service.get_profile_by_user_id(db, user_id=user_id)
    if not profile:
        # Si c'est le profil de l'utilisateur courant et qu'il n'existe pas, on pourrait le créer.
        # Si c'est le profil d'un autre utilisateur (donc current_user est superuser) et qu'il n'existe pas, on renvoie 404.
        if user_id == current_user.id:
            profile = profile_service.create_user_profile(db, user=current_user, profile_in=profile_schema.ProfileCreate())
            if not profile:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create or retrieve profile.")
        else:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Profile not found for user {user_id}.")
    
    # Correction: Convertir explicitement l'objet SQLAlchemy en dictionnaire compatible avec le schéma Pydantic
    profile_dict = {
        "id": profile.id,
        "user_id": profile.user_id,
        "bio": profile.bio or "",
        "profile_picture_url": profile.profile_picture_url,
        "disc_type": profile.disc_type,
        "disc_assessment_results": profile.disc_assessment_results or {},
        "interests": profile.interests or [],
        "skills": profile.skills or [],
        "objectives": profile.objectives if hasattr(profile, "objectives") else None,
        "updated_at": profile.updated_at
    }
    
    return profile_dict

# --- DISC Assessment Routes ---

@router.get("/disc/questionnaire", response_model=List[disc_schema.DISCQuestion])
@profile_router_limiter.limit("20/minute")
async def get_disc_assessment_questionnaire(
    request: Request,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    return disc_service.get_disc_questionnaire()

@router.post("/disc/assess", response_model=profile_schema.DISCResults)
@profile_router_limiter.limit("5/hour")
async def submit_disc_assessment(
    request: Request,
    assessment_submission: profile_schema.DiscAssessmentSubmission,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    try:
        updated_profile_with_disc = await disc_service.assess_and_update_profile(
            db=db, 
            user_id=current_user.id, 
            answers_submission=assessment_submission
        )
        if not updated_profile_with_disc or not updated_profile_with_disc.disc_type or not updated_profile_with_disc.disc_assessment_results:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to assess DISC profile or results are incomplete.")
        
        # Correction: S'assurer que disc_assessment_results est un dictionnaire
        disc_assessment_results = updated_profile_with_disc.disc_assessment_results or {}
        
        return profile_schema.DISCResults(
            disc_type=updated_profile_with_disc.disc_type,
            scores=disc_assessment_results.get("scores", {"D": 0, "I": 0, "S": 0, "C": 0}),
            summary=disc_assessment_results.get("summary", "")
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error during DISC assessment for user {current_user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred during DISC assessment.")

@router.get("/disc/results", response_model=profile_schema.DISCResults)
@profile_router_limiter.limit("30/minute")
async def get_my_disc_results(
    request: Request,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    profile = profile_service.get_profile_by_user_id(db, user_id=current_user.id)
    if not profile or not profile.disc_type or not profile.disc_assessment_results:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DISC assessment results not found for this user. Please complete the assessment first.")

    # Correction: S'assurer que disc_assessment_results est un dictionnaire
    disc_assessment_results = profile.disc_assessment_results or {}
    
    # Correction: S'assurer que scores est un dictionnaire valide
    scores = disc_assessment_results.get("scores", {})
    if not isinstance(scores, dict) or not all(k in scores for k in ["D", "I", "S", "C"]):
        scores = {"D": 0, "I": 0, "S": 0, "C": 0}

    return profile_schema.DISCResults(
        disc_type=profile.disc_type,
        scores=scores,
        summary=disc_assessment_results.get("summary", "")
    )
