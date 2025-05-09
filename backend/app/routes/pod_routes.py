# Routes pour la gestion des Pods (capsules audio)

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from ..schemas import pod_schema, user_schema
from ..services import pod_service, storage_service, transcription_service
from ..database import get_db
from ..utils import security

from slowapi import Limiter
from slowapi.util import get_remote_address

pod_router_limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/pods",
    tags=["Pods"],
    dependencies=[Depends(security.get_current_active_user)]
)

@router.post("/", response_model=pod_schema.Pod)
@pod_router_limiter.limit("10/minute")
async def create_new_pod(
    request: Request,
    title: str = Form(..., min_length=3, max_length=150),
    description: Optional[str] = Form(None, max_length=5000),
    tags: Optional[str] = Form(None),
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    # Vérification du type de fichier
    if not audio_file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid audio file type.")

    # Vérification de la taille du fichier
    content = await audio_file.read()
    MAX_FILE_SIZE = 50 * 1024 * 1024
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"Audio file too large. Max size is {MAX_FILE_SIZE // (1024*1024)} MB.")
    await audio_file.seek(0)  # Revenir au début du fichier pour l'upload

    audio_file_url = await storage_service.upload_audio_to_supabase(file=audio_file, user_id=current_user.id)
    if not audio_file_url:
        raise HTTPException(status_code=500, detail="Audio upload failed. Try again later.")

    tags_list = []
    if tags:
        raw_tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
        if len(raw_tags) > 20:
            raise HTTPException(status_code=400, detail="Too many tags. Max is 20.")
        for tag in raw_tags:
            if len(tag) > 50:
                raise HTTPException(status_code=400, detail=f"Tag '{tag}' is too long. Max 50 characters.")
            tags_list.append(tag)

    pod_in = pod_schema.PodCreate(title=title, description=description, tags=tags_list)
    return pod_service.create_pod(db=db, pod_create_schema=pod_in, owner_id=current_user.id, audio_url=str(audio_file_url))


@router.post("/{pod_id}/transcribe", response_model=pod_schema.Pod)
@pod_router_limiter.limit("5/minute")
async def transcribe_pod_audio(
    request: Request,
    pod_id: int,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    db_pod = pod_service.get_pod(db, pod_id=pod_id)
    if not db_pod:
        raise HTTPException(status_code=404, detail="Pod not found.")
    if db_pod.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized.")
    if not db_pod.audio_file_url:
        raise HTTPException(status_code=400, detail="No audio file to transcribe.")

    try:
        updated_pod = await transcription_service.transcribe_and_update_pod(db=db, pod_id=pod_id, audio_url=db_pod.audio_file_url)
        if not updated_pod:
            raise HTTPException(status_code=500, detail="Failed to save transcription.")
        return updated_pod
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error during transcription.")


@router.get("/", response_model=List[pod_schema.Pod])
@pod_router_limiter.limit("60/minute")
async def read_pods(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    limit = min(limit, 200)
    return pod_service.get_all_pods(db, skip=skip, limit=limit)


@router.get("/mine", response_model=List[pod_schema.Pod])
@pod_router_limiter.limit("60/minute")
async def read_my_pods(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    limit = min(limit, 200)
    return pod_service.get_pods_by_owner(db, owner_id=current_user.id, skip=skip, limit=limit)


@router.get("/{pod_id}", response_model=pod_schema.Pod)
@pod_router_limiter.limit("120/minute")
async def read_pod(
    request: Request,
    pod_id: int,
    db: Session = Depends(get_db)
):
    db_pod = pod_service.get_pod(db, pod_id=pod_id)
    if db_pod is None:
        raise HTTPException(status_code=404, detail="Pod not found.")
    return db_pod


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
    db_pod = pod_service.get_pod(db, pod_id=pod_id)
    if not db_pod:
        raise HTTPException(status_code=404, detail="Pod not found.")
    if db_pod.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized.")

    update_data = {}
    if title: update_data["title"] = title
    if description: update_data["description"] = description

    if tags is not None:
        tag_list = []
        raw_tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
        if len(raw_tags) > 20:
            raise HTTPException(status_code=400, detail="Too many tags. Max is 20.")
        for tag in raw_tags:
            if len(tag) > 50:
                raise HTTPException(status_code=400, detail=f"Tag '{tag}' is too long. Max 50 characters.")
            tag_list.append(tag)
        update_data["tags"] = tag_list

    if audio_file:
        if not audio_file.content_type.startswith("audio/"):
            raise HTTPException(status_code=400, detail="Invalid audio file type.")
        content = await audio_file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Audio file too large.")
        await audio_file.seek(0)
        audio_url = await storage_service.upload_audio_to_supabase(audio_file, current_user.id)
        if not audio_url:
            raise HTTPException(status_code=500, detail="Audio upload failed.")
        update_data["audio_file_url"] = audio_url

    return pod_service.update_pod(db=db, pod_id=pod_id, update_data=update_data)
