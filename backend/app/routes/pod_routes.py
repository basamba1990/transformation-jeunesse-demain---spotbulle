from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from ..schemas import pod_schema, user_schema
from ..services import pod_service, storage_service, transcription_service
from ..utils import security
from ..database import get_db

from slowapi import Limiter
from slowapi.util import get_remote_address

# Configuration du logger
logger = logging.getLogger(__name__)
pod_router_limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/pods",
    tags=["Pods"],
    dependencies=[Depends(security.get_current_active_user)],
    responses={
        404: {"description": "Ressource non trouvée"},
        403: {"description": "Accès non autorisé"}
    }
)

@router.post(
    "",
    response_model=pod_schema.Pod,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un nouveau Pod",
    responses={
        201: {"description": "Pod créé avec succès"},
        400: {"description": "Données invalides"},
        413: {"description": "Fichier trop volumineux"}
    }
)
@pod_router_limiter.limit("10/minute")
async def create_pod(
    request: Request,
    title: str = Form(..., min_length=3, max_length=150),
    description: Optional[str] = Form(None, max_length=5000),
    tags: Optional[str] = Form(None),
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    """
    Crée un nouveau Pod audio avec métadonnées et fichier audio
    """
    # Validation du fichier audio
    if not audio_file.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Type de fichier audio non supporté"
        )

    # Vérification taille fichier (50MB max)
    MAX_SIZE = 50 * 1024 * 1024  # 50MB
    content = await audio_file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Taille maximale autorisée : {MAX_SIZE//(1024*1024)}MB"
        )
    await audio_file.seek(0)

    try:
        # Traitement des tags
        tag_list = []
        if tags:
            raw_tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
            if len(raw_tags) > 20:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum 20 tags autorisés"
                )
            for tag in raw_tags:
                if len(tag) > 50:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Tag trop long : '{tag[:20]}...' (max 50 caractères)"
                    )
                tag_list.append(tag)

        # Upload du fichier audio
        audio_url = await storage_service.upload_audio(
            file=audio_file,
            user_id=current_user.id
        )

        # Création du Pod en base
        return pod_service.create_pod(
            db=db,
            title=title,
            description=description,
            tags=tag_list,
            audio_url=audio_url,
            owner_id=current_user.id
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erreur création Pod : {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur interne lors de la création du Pod"
        )

@router.post(
    "/{pod_id}/transcribe",
    response_model=pod_schema.Pod,
    summary="Transcrire un Pod",
    responses={
        200: {"description": "Transcription réussie"},
        404: {"description": "Pod non trouvé"},
        403: {"description": "Droits insuffisants"}
    }
)
@pod_router_limiter.limit("5/minute")
async def transcribe_pod(
    request: Request,
    pod_id: int,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    """
    Lance la transcription audio-textuel d'un Pod existant
    """
    try:
        # Vérification existence et droits
        db_pod = pod_service.get_pod(db, pod_id)
        if not db_pod:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pod introuvable")
        
        if db_pod.owner_id != current_user.id and not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à effectuer cette action"
            )

        # Appel service de transcription
        return await transcription_service.transcribe_pod(
            db=db,
            pod_id=pod_id,
            audio_url=db_pod.audio_file_url
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erreur transcription Pod {pod_id} : {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Échec de la transcription audio"
        )

@router.get(
    "",
    response_model=List[pod_schema.Pod],
    summary="Lister tous les Pods",
    responses={200: {"description": "Liste des Pods récupérée"}}
)
@pod_router_limiter.limit("60/minute")
async def get_all_pods(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Récupère la liste de tous les Pods publics
    """
    try:
        return pod_service.get_pods(db, skip=skip, limit=min(limit, 200))
    except Exception as e:
        logger.error(f"Erreur récupération Pods : {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des Pods"
        )

@router.get(
    "/me",
    response_model=List[pod_schema.Pod],
    summary="Mes Pods",
    responses={200: {"description": "Liste des Pods de l'utilisateur"}}
)
@pod_router_limiter.limit("60/minute")
async def get_my_pods(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    """
    Récupère la liste des Pods de l'utilisateur courant
    """
    try:
        return pod_service.get_user_pods(
            db=db,
            user_id=current_user.id,
            skip=skip,
            limit=min(limit, 200)
        )
    except Exception as e:
        logger.error(f"Erreur récupération Pods utilisateur {current_user.id} : {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération de vos Pods"
        )

@router.get(
    "/{pod_id}",
    response_model=pod_schema.Pod,
    summary="Obtenir un Pod",
    responses={200: {"description": "Détails du Pod demandé"}}
)
@pod_router_limiter.limit("120/minute")
async def get_pod(
    request: Request,
    pod_id: int,
    db: Session = Depends(get_db)
):
    """
    Récupère les détails d'un Pod spécifique
    """
    try:
        pod = pod_service.get_pod(db, pod_id)
        if not pod:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pod introuvable")
        return pod
    except Exception as e:
        logger.error(f"Erreur récupération Pod {pod_id} : {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération du Pod"
        )

@router.put(
    "/{pod_id}",
    response_model=pod_schema.Pod,
    summary="Mettre à jour un Pod",
    responses={
        200: {"description": "Pod mis à jour"},
        404: {"description": "Pod non trouvé"},
        403: {"description": "Droits insuffisants"}
    }
)
@pod_router_limiter.limit("10/minute")
async def update_pod(
    request: Request,
    pod_id: int,
    title: Optional[str] = Form(None, min_length=3, max_length=150),
    description: Optional[str] = Form(None, max_length=5000),
    tags: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    """
    Met à jour les informations d'un Pod existant
    """
    try:
        # Vérification existence et droits
        db_pod = pod_service.get_pod(db, pod_id)
        if not db_pod:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pod introuvable")
        
        if db_pod.owner_id != current_user.id and not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Action non autorisée sur ce Pod"
            )

        update_data = {}
        if title: update_data["title"] = title
        if description: update_data["description"] = description

        # Traitement des tags
        if tags is not None:
            tag_list = []
            raw_tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
            if len(raw_tags) > 20:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum 20 tags autorisés"
                )
            for tag in raw_tags:
                if len(tag) > 50:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Tag trop long : '{tag[:20]}...' (max 50 caractères)"
                    )
                tag_list.append(tag)
            update_data["tags"] = tag_list

        # Traitement fichier audio
        if audio_file:
            if not audio_file.content_type.startswith("audio/"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Type de fichier audio non supporté"
                )
            
            content = await audio_file.read()
            if len(content) > 50 * 1024 * 1024:  # 50MB
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Fichier audio trop volumineux (max 50MB)"
                )
            await audio_file.seek(0)
            
            audio_url = await storage_service.upload_audio(
                file=audio_file,
                user_id=current_user.id
            )
            update_data["audio_file_url"] = audio_url

        return pod_service.update_pod(
            db=db,
            pod_id=pod_id,
            update_data=update_data
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erreur mise à jour Pod {pod_id} : {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour du Pod"
        )

@router.delete(
    "/{pod_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un Pod",
    responses={
        204: {"description": "Pod supprimé"},
        404: {"description": "Pod non trouvé"},
        403: {"description": "Droits insuffisants"}
    }
)
@pod_router_limiter.limit("10/minute")
async def delete_pod(
    request: Request,
    pod_id: int,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    """
    Supprime définitivement un Pod
    """
    try:
        db_pod = pod_service.get_pod(db, pod_id)
        if not db_pod:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pod introuvable")
        
        if db_pod.owner_id != current_user.id and not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Action non autorisée sur ce Pod"
            )

        pod_service.delete_pod(db=db, pod_id=pod_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erreur suppression Pod {pod_id} : {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression du Pod"
        )
