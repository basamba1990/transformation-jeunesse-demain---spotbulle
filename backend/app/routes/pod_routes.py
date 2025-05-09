from fastapi import APIRouter, Request, Form, File, UploadFile, Depends, HTTPException, status
from typing import Optional
from sqlalchemy.orm import Session
from app.schemas import pod as pod_schema, user as user_schema
from app.services import pod as pod_service, storage as storage_service
from app.dependencies import get_db
from app.core import security
from app.rate_limiter import pod_router_limiter

router = APIRouter()

@router.put("/{pod_id}", response_model=pod_schema.Pod)
@pod_router_limiter.limit("10/minute")
async def update_existing_pod(
    request: Request,
    pod_id: int,
    title: Optional[str] = Form(None, min_length=3, max_length=150),
    description: Optional[str] = Form(None, max_length=5000),
    tags: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    # Récupération du pod existant
    db_pod = pod_service.get_pod(db, pod_id=pod_id)
    if db_pod is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Pod with ID {pod_id} not found.")
    
    # Vérification des permissions
    if db_pod.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this pod.")

    update_data_dict = {}

    # Mise à jour du titre
    if title is not None:
        update_data_dict["title"] = title

    # Mise à jour de la description
    if description is not None:
        update_data_dict["description"] = description

    # Traitement des tags
    if tags is not None:
        tags_list = []
        if tags.strip():
            raw_tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
            if len(raw_tags) > 20:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Too many tags. Maximum 20 tags allowed."
                )
            for tag_item in raw_tags:
                if len(tag_item) > 50:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Tag '{tag_item}' is too long. Maximum 50 characters per tag."
                    )
                tags_list.append(tag_item)
        update_data_dict["tags"] = tags_list

    # Gestion du fichier audio
    if audio_file:
        if not audio_file.content_type.startswith("audio/"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid audio file type for update.")

        MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
        contents = await audio_file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"New audio file too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB."
            )
        await audio_file.seek(0)  # Revenir au début pour l'upload

        # Supprimer l'ancien fichier si présent
        if db_pod.audio_file_url:
            await storage_service.delete_audio_from_supabase(db_pod.audio_file_url)

        # Uploader le nouveau fichier
        new_audio_url = await storage_service.upload_audio_to_supabase(file=audio_file, user_id=current_user.id)
        if not new_audio_url:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to upload new audio file.")
        update_data_dict["audio_file_url"] = str(new_audio_url)

    # Mise à jour finale
    updated_pod = pod_service.update_pod(db=db, pod_id=pod_id, update_data=update_data_dict)
    return updated_pod
