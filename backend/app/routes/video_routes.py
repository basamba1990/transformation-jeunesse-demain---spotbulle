from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request, Response
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import tempfile
import os

from ..schemas import pod_schema, user_schema
from ..services import pod_service, storage_service, transcription_service, video_service
from ..utils import security
from ..database import get_db

from slowapi import Limiter
from slowapi.util import get_remote_address

# Configuration du logger
logger = logging.getLogger(__name__)
video_router_limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="",
    tags=["Videos"],
    # Retrait de la dépendance globale pour permettre l'accès public aux routes de lecture
    # dependencies=[Depends(security.get_current_active_user)],
    responses={
        404: {"description": "Ressource non trouvée"},
        403: {"description": "Accès non autorisé"}
    }
)

@router.post(
    "/upload",
    response_model=pod_schema.Pod,
    status_code=status.HTTP_201_CREATED,
    summary="Téléverser une vidéo et créer un Pod",
    responses={
        201: {"description": "Vidéo téléversée et Pod créé avec succès"},
        400: {"description": "Données invalides"},
        413: {"description": "Fichier trop volumineux"}
    },
    dependencies=[Depends(security.get_current_active_user)]  # Protection spécifique ajoutée ici
)
@video_router_limiter.limit("5/minute")
async def upload_video(
    request: Request,
    title: str = Form(..., min_length=3, max_length=150),
    description: Optional[str] = Form(None, max_length=5000),
    tags: Optional[str] = Form(None),
    video_file: UploadFile = File(...),
    transcribe: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    """
    Téléverse une vidéo, extrait l'audio, crée un Pod et optionnellement transcrit l'audio
    """
    # Validation du fichier vidéo
    valid_video_types = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-ms-wmv"]
    if video_file.content_type not in valid_video_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Type de fichier vidéo non supporté. Types acceptés: {', '.join(valid_video_types)}"
        )

    # Vérification taille fichier (100MB max)
    MAX_SIZE = 100 * 1024 * 1024  # 100MB
    content = await video_file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Taille maximale autorisée : {MAX_SIZE//(1024*1024)}MB"
        )
    await video_file.seek(0)

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

        # Sauvegarder temporairement le fichier vidéo
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(video_file.filename)[1]) as temp_video:
            temp_video.write(content)
            temp_video_path = temp_video.name

        try:
            # Extraire l'audio de la vidéo
            audio_file_path = await video_service.extract_audio_from_video(temp_video_path)
            
            # Téléverser le fichier audio extrait
            with open(audio_file_path, "rb") as audio_file:
                audio_url = await storage_service.upload_audio_from_file(
                    file_content=audio_file.read(),
                    filename=f"{os.path.splitext(video_file.filename)[0]}.mp3",
                    user_id=current_user.id
                )
            
            # Création du Pod en base
            pod = pod_service.create_pod(
                db=db,
                title=title,
                description=description,
                tags=tag_list,
                audio_url=audio_url,
                owner_id=current_user.id
            )
            
            # Transcription si demandée
            if transcribe:
                pod = await transcription_service.transcribe_pod(
                    db=db,
                    pod_id=pod.id,
                    audio_url=audio_url
                )
            
            # Convertir l'objet ORM en modèle Pydantic
            return pod_schema.Pod.model_validate(pod) if hasattr(pod_schema.Pod, 'model_validate') else pod_schema.Pod.from_orm(pod)
        
        finally:
            # Nettoyage des fichiers temporaires
            if os.path.exists(temp_video_path):
                os.unlink(temp_video_path)
            if 'audio_file_path' in locals() and os.path.exists(audio_file_path):
                os.unlink(audio_file_path)

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erreur téléversement vidéo : {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne lors du téléversement de la vidéo: {str(e)}"
        )
