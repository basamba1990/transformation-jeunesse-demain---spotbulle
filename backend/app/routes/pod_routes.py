# backend/app/routes/pod_routes_compatible.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request, Response
from sqlalchemy.orm import Session
from typing import List, Optional, Annotated
import logging
from pydantic import BaseModel

from ..schemas import pod_schema, user_schema
from ..services import pod_service, storage_service, transcription_service
from ..utils import security
from ..database import get_db

from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)
pod_router_limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/pods",
    tags=["Pods"],
    responses={
        404: {"description": "Ressource non trouvée"},
        403: {"description": "Accès non autorisé"}
    }
)

# ===== MODÈLES POUR COMPATIBILITÉ FRONTEND =====

class PodResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    author: str
    duration: str
    plays: int
    likes: int
    created_at: str
    audio_url: Optional[str] = None

class PodCreateRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "Général"

# ===== ROUTES COMPATIBLES FRONTEND =====

@router.get(
    "",
    response_model=List[PodResponse],
    summary="Récupérer tous les pods"
)
async def get_all_pods(
    db: Session = Depends(get_db),
    current_user: Annotated[user_schema.User, Depends(security.get_current_active_user)]
):
    """Récupération de tous les pods (compatible frontend)"""
    try:
        # Utiliser le service existant ou créer des données de démo
        pods = []
        
        # Données de démo pour le frontend
        demo_pods = [
            {
                "id": "pod-1",
                "title": "Ma transformation personnelle",
                "description": "Partage de mon parcours de développement personnel",
                "category": "Développement Personnel",
                "author": current_user.full_name or current_user.email,
                "duration": "5:30",
                "plays": 1250,
                "likes": 89,
                "created_at": "2024-06-01T10:00:00Z",
                "audio_url": "/static/audio/pod-1.mp3"
            },
            {
                "id": "pod-2", 
                "title": "Mes objectifs 2024",
                "description": "Comment j'ai défini et atteint mes objectifs cette année",
                "category": "Motivation",
                "author": current_user.full_name or current_user.email,
                "duration": "8:15",
                "plays": 2100,
                "likes": 156,
                "created_at": "2024-06-05T14:30:00Z",
                "audio_url": "/static/audio/pod-2.mp3"
            },
            {
                "id": "pod-3",
                "title": "L'importance de l'écoute",
                "description": "Réflexions sur l'art de l'écoute active",
                "category": "Communication",
                "author": current_user.full_name or current_user.email,
                "duration": "6:45",
                "plays": 890,
                "likes": 67,
                "created_at": "2024-06-08T09:15:00Z",
                "audio_url": "/static/audio/pod-3.mp3"
            }
        ]
        
        return [PodResponse(**pod) for pod in demo_pods]
        
    except Exception as e:
        logger.error(f"Erreur récupération pods: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des pods"
        )

@router.get(
    "/my",
    response_model=List[PodResponse],
    summary="Récupérer mes pods"
)
async def get_my_pods(
    db: Session = Depends(get_db),
    current_user: Annotated[user_schema.User, Depends(security.get_current_active_user)]
):
    """Récupération des pods de l'utilisateur connecté"""
    try:
        # Filtrer les pods de l'utilisateur (pour la démo, retourner tous)
        demo_pods = [
            {
                "id": "pod-1",
                "title": "Ma transformation personnelle",
                "description": "Partage de mon parcours de développement personnel",
                "category": "Développement Personnel",
                "author": current_user.full_name or current_user.email,
                "duration": "5:30",
                "plays": 1250,
                "likes": 89,
                "created_at": "2024-06-01T10:00:00Z",
                "audio_url": "/static/audio/pod-1.mp3"
            }
        ]
        
        return [PodResponse(**pod) for pod in demo_pods]
        
    except Exception as e:
        logger.error(f"Erreur récupération mes pods: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération de vos pods"
        )

@router.post(
    "",
    response_model=PodResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un nouveau pod"
)
async def create_pod(
    pod_data: PodCreateRequest,
    db: Session = Depends(get_db),
    current_user: Annotated[user_schema.User, Depends(security.get_current_active_user)]
):
    """Création d'un nouveau pod"""
    try:
        # Créer un nouveau pod (simulation)
        new_pod = {
            "id": f"pod-{hash(pod_data.title) % 10000}",
            "title": pod_data.title,
            "description": pod_data.description,
            "category": pod_data.category,
            "author": current_user.full_name or current_user.email,
            "duration": "0:00",
            "plays": 0,
            "likes": 0,
            "created_at": "2024-06-09T12:00:00Z",
            "audio_url": None
        }
        
        return PodResponse(**new_pod)
        
    except Exception as e:
        logger.error(f"Erreur création pod: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du pod"
        )

@router.post(
    "/upload",
    summary="Upload d'un fichier audio"
)
async def upload_audio(
    audio: UploadFile = File(...),
    current_user: Annotated[user_schema.User, Depends(security.get_current_active_user)]
):
    """Upload d'un fichier audio pour un pod"""
    try:
        # Validation du fichier
        if not audio.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le fichier doit être un fichier audio"
            )
        
        # Simulation de l'upload
        return {
            "message": "Fichier audio uploadé avec succès",
            "filename": audio.filename,
            "size": audio.size,
            "url": f"/static/audio/{audio.filename}"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erreur upload audio: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'upload du fichier audio"
        )

