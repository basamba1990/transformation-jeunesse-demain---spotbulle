# Routes pour la gestion des Pods (capsules audio)

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from ..schemas import pod_schema, user_schema # Schémas Pydantic
from ..services import pod_service, storage_service, transcription_service # Services CRUD, stockage et transcription
from ..database import get_db # Dépendance pour la session DB
from ..utils import security # Pour l_authentification

from slowapi import Limiter
from slowapi.util import get_remote_address

pod_router_limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/pods",
    tags=["Pods"],
    dependencies=[Depends(security.get_current_active_user)] # Sécurise toutes les routes de ce routeur
)

@router.post("/", response_model=pod_schema.Pod)
@pod_router_limiter.limit("10/minute") # Limite la création de pods
async def create_new_pod(
    request: Request,
    title: str = Form(..., min_length=3, max_length=150),
    description: Optional[str] = Form(None, max_length=5000),
    tags: Optional[str] = Form(None), # Recevoir les tags comme une chaîne, à parser ensuite
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    # Validation de la taille et du type de fichier (peut être ajoutée ici ou dans storage_service)
    if not audio_file.content_type.startswith("audio/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid audio file type.")
    # Limiter la taille du fichier, par exemple à 50MB
    MAX_FILE_SIZE = 50 * 1024 * 1024 # 50 MB
    if audio_file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"Audio file too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB.")

    audio_file_url = await storage_service.upload_audio_to_supabase(file=audio_file, user_id=current_user.id)
    if not audio_file_url:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not upload audio file. Please try again later.")
    
    tags_list = []
    if tags:
        raw_tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
        if len(raw_tags) > 20: # Correspond à la validation du schéma
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Too many tags. Maximum 20 tags allowed.")
        for tag_item in raw_tags:
            if len(tag_item) > 50: # Limite de longueur par tag
                 raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Tag 
{tag_item}
 is too long. Maximum 50 characters per tag.")
            tags_list.append(tag_item)

    # Les champs title et description sont déjà validés par Pydantic via Form(min_length, max_length)
    pod_in_data = {
        "title": title,
        "description": description,
        "tags": tags_list,
        # audio_file_url est ajouté par le service, pas directement par l_utilisateur
    }
    pod_in = pod_schema.PodCreate(**pod_in_data) # Valide avec le schéma Pydantic
    
    return pod_service.create_pod(db=db, pod_create_schema=pod_in, owner_id=current_user.id, audio_url=str(audio_file_url))

@router.post("/{pod_id}/transcribe", response_model=pod_schema.Pod)
@pod_router_limiter.limit("5/minute") # Limite les demandes de transcription
async def transcribe_pod_audio(
    request: Request,
    pod_id: int,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    db_pod = pod_service.get_pod(db, pod_id=pod_id)
    if not db_pod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Pod with ID {pod_id} not found.")
    
    if db_pod.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to transcribe this pod.")

    if not db_pod.audio_file_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Pod has no audio file to transcribe.")

    try:
        # Le service de transcription devrait gérer ses propres erreurs et les remonter
        updated_pod = await transcription_service.transcribe_and_update_pod(db=db, pod_id=pod_id, audio_url=db_pod.audio_file_url)
        if not updated_pod:
            # Ce cas pourrait survenir si la transcription réussit mais la mise à jour DB échoue
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save transcription to database after successful transcription.")
        return updated_pod
    except HTTPException as e:
        raise e # Retransmettre les exceptions HTTP spécifiques (ex: API key manquante, service indisponible)
    except Exception as e:
        print(f"Unexpected error during transcription process for pod {pod_id}: {e}") # Log l_erreur côté serveur
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred during transcription. Please try again later.")


@router.get("/", response_model=List[pod_schema.Pod])
@pod_router_limiter.limit("60/minute") # Limite pour la liste publique des pods
async def read_pods(
    request: Request,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    # Pas besoin de current_user ici si c_est une liste publique, mais le router l_exige déjà
    # Si on veut que cette route soit accessible sans token, il faut la sortir du router principal
    # ou rendre la dépendance `get_current_active_user` optionnelle pour cette route spécifique.
    # Pour l_instant, elle reste protégée.
):
    if limit > 200: # Limiter la pagination maximale
        limit = 200
    pods = pod_service.get_all_pods(db, skip=skip, limit=limit)
    return pods

@router.get("/mine", response_model=List[pod_schema.Pod])
@pod_router_limiter.limit("60/minute")
async def read_my_pods(
    request: Request,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    if limit > 200:
        limit = 200
    pods = pod_service.get_pods_by_owner(db, owner_id=current_user.id, skip=skip, limit=limit)
    return pods

@router.get("/{pod_id}", response_model=pod_schema.Pod)
@pod_router_limiter.limit("120/minute")
async def read_pod(
    request: Request,
    pod_id: int,
    db: Session = Depends(get_db),
    # current_user: user_schema.User = Depends(security.get_current_active_user) # Déjà requis par le routeur
):
    db_pod = pod_service.get_pod(db, pod_id=pod_id)
    if db_pod is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Pod with ID {pod_id} not found.")
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
    if db_pod is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Pod with ID {pod_id} not found.")
    if db_pod.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this pod.")

    update_data_dict = {}
    if title is not None: update_data_dict["title"] = title
    if description is not None: update_data_dict["description"] = description
    
    if tags is not None:
        tags_list = []
        if tags: # Peut être une chaîne vide si l_utilisateur veut effacer les tags
            raw_tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
            if len(raw_tags) > 20:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Too many tags. Maximum 20 tags allowed.")
            for tag_item in raw_tags:
                if len(tag_item) > 50:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Tag 
{tag_item}
 is too long. Maximum 50 characters per tag.")
                tags_list.append(tag_item)
        update_data_dict["tags"] = tags_list

    if audio_file:
        if not audio_file.content_type.startswith("audio/"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid audio file type for update.")
        MAX_FILE_SIZE = 50 * 1024 * 1024 # 50 MB
        if audio_file.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"New audio file too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB.")

        if db_pod.audio_file_url:
            await storage_service.delete_audio_from_supabase(db_pod.audio_file_url)
        new_audio_file_url = await storage_service.upload_audio_to_supabase(file=audio_file, user_id=current_user.id)
        if not new_audio_file_url:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not upload new audio file. Please try again later.")
        update_data_dict["audio_file_url"] = str(new_audio_file_url)
    
    if not update_data_dict and not audio_file: # Si rien n_est fourni pour la mise à jour
        return db_pod # Retourner le pod existant sans modification
        # Ou lever une erreur si une modification est attendue
        # raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided.")

    pod_update_schema = pod_schema.PodUpdate(**update_data_dict) # Valide avec Pydantic
    return pod_service.update_pod(db=db, pod_id=pod_id, pod_update_schema=pod_update_schema)

@router.delete("/{pod_id}", status_code=status.HTTP_204_NO_CONTENT)
@pod_router_limiter.limit("10/minute")
async def delete_existing_pod(
    request: Request,
    pod_id: int,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(security.get_current_active_user)
):
    db_pod = pod_service.get_pod(db, pod_id=pod_id)
    if db_pod is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Pod with ID {pod_id} not found.")
    if db_pod.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this pod.")
    
    audio_url_to_delete = db_pod.audio_file_url
    # Le service s_occupe de la suppression en base de données
    delete_successful = pod_service.delete_pod(db=db, pod_id=pod_id, user_id=current_user.id, is_superuser=current_user.is_superuser)
    
    if not delete_successful:
        # Cela pourrait arriver si la logique de suppression dans le service échoue pour une raison non liée à l_existence du pod
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not delete pod data from database.")

    if audio_url_to_delete:
        delete_storage_success = await storage_service.delete_audio_from_supabase(audio_url_to_delete)
        if not delete_storage_success:
            # Log l_erreur mais ne pas bloquer la réponse car la donnée DB est supprimée
            print(f"Warning: Pod data for ID {pod_id} deleted, but failed to delete audio file {audio_url_to_delete} from storage. Manual cleanup may be required.")
    return # Retourne 204 No Content


