from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request, Response
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
    prefix="",
    tags=["Pods"],
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
    },
    dependencies=[Depends(security.get_current_active_user)]
)
@pod_router_limiter.limit("10/minute")
async def create_pod(
    request: Request,
    current_user: user_schema.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db),
    title: str = Form(..., min_length=3, max_length=150),
    description: Optional[str] = Form(None, max_length=5000),
    tags: Optional[str] = Form(None),
    audio_file: UploadFile = File(...)
):
    """
    Créer un nouveau Pod audio avec métadonnées et fichier audio.
    
    - **title**: Titre du Pod (3-150 caractères)
    - **description**: Description optionnelle (max 5000 caractères)
    - **tags**: Tags optionnels séparés par des virgules
    - **audio_file**: Fichier audio (formats supportés: mp3, wav, m4a, ogg)
    """
    try:
        logger.info(f"Création d'un nouveau Pod par l'utilisateur {current_user.id}: {title}")
        
        # Validation du fichier audio
        if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le fichier doit être un fichier audio valide"
            )
        
        # Validation de la taille du fichier (100 MB max)
        if audio_file.size and audio_file.size > 104857600:  # 100 MB en octets
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Le fichier audio ne peut pas dépasser 100 MB"
            )
        
        # Préparation des données du Pod
        pod_data = pod_schema.PodCreate(
            title=title,
            description=description or "",
            tags=tags.split(',') if tags else []
        )
        
        # Création du Pod via le service
        created_pod = await pod_service.create_pod_with_audio(
            db=db,
            pod_data=pod_data,
            audio_file=audio_file,
            user_id=current_user.id
        )
        
        logger.info(f"Pod créé avec succès: {created_pod.id}")
        return created_pod
        
    except HTTPException as he:
        logger.warning(f"Erreur HTTP lors de la création du Pod: {he.detail}")
        raise he
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la création du Pod: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur interne lors de la création du Pod"
        )

@router.get(
    "",
    response_model=List[pod_schema.Pod],
    summary="Récupérer tous les Pods",
    responses={
        200: {"description": "Liste des Pods récupérée avec succès"},
        500: {"description": "Erreur serveur"}
    }
)
async def get_all_pods(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    tags: Optional[str] = None
):
    """
    Récupérer tous les Pods publics avec pagination et filtres optionnels.
    
    - **skip**: Nombre d'éléments à ignorer (pagination)
    - **limit**: Nombre maximum d'éléments à retourner
    - **search**: Terme de recherche dans le titre et la description
    - **tags**: Tags à filtrer (séparés par des virgules)
    """
    try:
        logger.info(f"Récupération des Pods - skip: {skip}, limit: {limit}, search: {search}")
        
        # Conversion des tags en liste si fournis
        tag_list = tags.split(',') if tags else None
        
        pods = await pod_service.get_pods(
            db=db,
            skip=skip,
            limit=limit,
            search=search,
            tags=tag_list
        )
        
        logger.info(f"Nombre de Pods récupérés: {len(pods)}")
        return pods
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des Pods: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des Pods"
        )

@router.get(
    "/my",
    response_model=List[pod_schema.Pod],
    summary="Récupérer mes Pods",
    dependencies=[Depends(security.get_current_active_user)]
)
async def get_my_pods(
    current_user: user_schema.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Récupérer tous les Pods de l'utilisateur connecté.
    """
    try:
        logger.info(f"Récupération des Pods de l'utilisateur {current_user.id}")
        
        pods = await pod_service.get_user_pods(
            db=db,
            user_id=current_user.id,
            skip=skip,
            limit=limit
        )
        
        logger.info(f"Nombre de Pods utilisateur récupérés: {len(pods)}")
        return pods
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des Pods utilisateur: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération de vos Pods"
        )

@router.get(
    "/{pod_id}",
    response_model=pod_schema.Pod,
    summary="Récupérer un Pod par ID"
)
async def get_pod(
    pod_id: int,
    db: Session = Depends(get_db)
):
    """
    Récupérer un Pod spécifique par son ID.
    """
    try:
        logger.info(f"Récupération du Pod {pod_id}")
        
        pod = await pod_service.get_pod(db=db, pod_id=pod_id)
        if not pod:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pod non trouvé"
            )
        
        return pod
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du Pod {pod_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération du Pod"
        )

@router.put(
    "/{pod_id}",
    response_model=pod_schema.Pod,
    summary="Mettre à jour un Pod",
    dependencies=[Depends(security.get_current_active_user)]
)
async def update_pod(
    pod_id: int,
    pod_update: pod_schema.PodUpdate,
    current_user: user_schema.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mettre à jour un Pod existant (seul le propriétaire peut modifier).
    """
    try:
        logger.info(f"Mise à jour du Pod {pod_id} par l'utilisateur {current_user.id}")
        
        # Vérifier que le Pod existe et appartient à l'utilisateur
        existing_pod = await pod_service.get_pod(db=db, pod_id=pod_id)
        if not existing_pod:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pod non trouvé"
            )
        
        if existing_pod.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à modifier ce Pod"
            )
        
        # Mise à jour du Pod
        updated_pod = await pod_service.update_pod(
            db=db,
            pod_id=pod_id,
            pod_update=pod_update
        )
        
        logger.info(f"Pod {pod_id} mis à jour avec succès")
        return updated_pod
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du Pod {pod_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour du Pod"
        )

@router.delete(
    "/{pod_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un Pod",
    dependencies=[Depends(security.get_current_active_user)]
)
async def delete_pod(
    pod_id: int,
    current_user: user_schema.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Supprimer un Pod (seul le propriétaire peut supprimer).
    """
    try:
        logger.info(f"Suppression du Pod {pod_id} par l'utilisateur {current_user.id}")
        
        # Vérifier que le Pod existe et appartient à l'utilisateur
        existing_pod = await pod_service.get_pod(db=db, pod_id=pod_id)
        if not existing_pod:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pod non trouvé"
            )
        
        if existing_pod.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à supprimer ce Pod"
            )
        
        # Suppression du Pod
        await pod_service.delete_pod(db=db, pod_id=pod_id)
        
        logger.info(f"Pod {pod_id} supprimé avec succès")
        return Response(status_code=status.HTTP_204_NO_CONTENT)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du Pod {pod_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression du Pod"
        )

@router.post(
    "/{pod_id}/like",
    summary="Liker un Pod",
    dependencies=[Depends(security.get_current_active_user)]
)
async def like_pod(
    pod_id: int,
    current_user: user_schema.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Ajouter ou retirer un like sur un Pod.
    """
    try:
        logger.info(f"Like du Pod {pod_id} par l'utilisateur {current_user.id}")
        
        result = await pod_service.toggle_like(
            db=db,
            pod_id=pod_id,
            user_id=current_user.id
        )
        
        return {"liked": result["liked"], "total_likes": result["total_likes"]}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erreur lors du like du Pod {pod_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors du like du Pod"
        )

@router.post(
    "/{pod_id}/play",
    summary="Enregistrer une écoute",
    dependencies=[Depends(security.get_current_active_user)]
)
async def record_play(
    pod_id: int,
    current_user: user_schema.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Enregistrer qu'un utilisateur a écouté un Pod.
    """
    try:
        logger.info(f"Écoute du Pod {pod_id} par l'utilisateur {current_user.id}")
        
        result = await pod_service.record_play(
            db=db,
            pod_id=pod_id,
            user_id=current_user.id
        )
        
        return {"total_plays": result["total_plays"]}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erreur lors de l'enregistrement de l'écoute du Pod {pod_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'enregistrement de l'écoute"
        )

