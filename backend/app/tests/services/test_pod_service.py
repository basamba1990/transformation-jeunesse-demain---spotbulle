# Tests pour le service pod_service.py

import pytest
from unittest.mock import MagicMock, patch, AsyncMock # Ajout de AsyncMock
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
import io

from app.services import pod_service, storage_service # Assurez-vous que transcription_service est importé si utilisé
from app.models import pod_model, user_model
from app.schemas import pod_schema

@pytest.fixture
def db_session_mock():
    db = MagicMock(spec=Session)
    return db

@pytest.fixture
def mock_current_user():
    user = user_model.User(id=1, email="test@example.com", full_name="Test User")
    return user

@pytest.fixture
def mock_pod_create_schema():
    return pod_schema.PodCreate(
        title="Nouveau Pod de Test", 
        description="Description du nouveau pod.", 
        tags=["test", "audio"]
    )

@pytest.fixture
def mock_existing_pod(mock_current_user):
    return pod_model.Pod(
        id=10,
        title="Pod Existant",
        description="Un pod déjà dans la base.",
        audio_file_url="http://example.com/audio.mp3",
        transcription=None,
        owner_id=mock_current_user.id, # S_assurer que owner_id est cohérent
        tags=["existant"]
    )

@pytest.fixture
def mock_upload_file():
    file_content = b"dummy audio content"
    file = MagicMock(spec=UploadFile)
    file.filename = "test_audio.mp3"
    file.file = io.BytesIO(file_content)
    file.content_type = "audio/mpeg"
    file.read = AsyncMock(return_value=file_content) # Utiliser AsyncMock pour read si le service est asynchrone
    return file

# --- Tests pour create_pod ---
@patch("app.services.storage_service.upload_file_to_storage", new_callable=AsyncMock)
@patch("app.services.pod_service.transcription_service.request_transcription", new_callable=AsyncMock)
async def test_create_pod_with_audio_success(
    mock_request_transcription, 
    mock_upload_to_storage, 
    db_session_mock, 
    mock_current_user, 
    mock_pod_create_schema, 
    mock_upload_file
):
    mock_upload_to_storage.return_value = "http://example.com/uploaded_audio.mp3"
    # Simuler le retour de la création de pod
    # Le service pod_service.create_pod va créer une instance de pod_model.Pod
    # Nous devons nous assurer que le mock de transcription est appelé avec le bon ID
    
    # Pour simuler la création de l_objet Pod dans le service:
    async def side_effect_create_pod(db, pod_data, user_id, audio_file):
        new_pod = pod_model.Pod(
            title=pod_data.title,
            description=pod_data.description,
            tags=pod_data.tags,
            owner_id=user_id,
            audio_file_url=await mock_upload_to_storage(file=audio_file, user_id=user_id, pod_title=pod_data.title)
        )
        # Simuler l_assignation d_un ID par la DB
        # Pour les tests, on peut le fixer ou le rendre dynamique si besoin
        new_pod.id = 123 
        db.add(new_pod)
        db.commit()
        db.refresh(new_pod)
        # Simuler l_appel à la transcription si elle est faite ici
        # await mock_request_transcription(db=db, pod_id=new_pod.id, user_id=user_id)
        return new_pod

    # Remplacer le service réel par notre side_effect pour ce test si nécessaire
    # ou mocker les étapes internes comme upload_file_to_storage et la création de l_objet Pod
    # Ici, nous testons pod_service.create_pod, donc nous mockons ses dépendances (storage, transcription)

    created_pod_db = await pod_service.create_pod(
        db=db_session_mock, 
        pod_data=mock_pod_create_schema, 
        user_id=mock_current_user.id, 
        audio_file=mock_upload_file
    )
    
    mock_upload_to_storage.assert_called_once_with(file=mock_upload_file, user_id=mock_current_user.id, pod_title=mock_pod_create_schema.title)
    db_session_mock.add.assert_called_once()
    db_session_mock.commit.assert_called_once()
    db_session_mock.refresh.assert_called_once_with(db_session_mock.add.call_args[0][0]) # Vérifier que l_objet ajouté est rafraîchi
    
    assert created_pod_db is not None
    assert created_pod_db.title == mock_pod_create_schema.title
    assert created_pod_db.description == mock_pod_create_schema.description
    assert created_pod_db.owner_id == mock_current_user.id
    assert created_pod_db.audio_file_url == "http://example.com/uploaded_audio.mp3"
    assert created_pod_db.tags == mock_pod_create_schema.tags
    # Si la transcription est appelée à la création:
    # mock_request_transcription.assert_called_once_with(db=db_session_mock, pod_id=created_pod_db.id, user_id=mock_current_user.id)

@patch("app.services.storage_service.upload_file_to_storage", new_callable=AsyncMock)
async def test_create_pod_upload_fails(
    mock_upload_to_storage, 
    db_session_mock, 
    mock_current_user, 
    mock_pod_create_schema, 
    mock_upload_file
):
    mock_upload_to_storage.side_effect = Exception("Upload failed")
    with pytest.raises(HTTPException) as exc_info:
        await pod_service.create_pod(
            db=db_session_mock, 
            pod_data=mock_pod_create_schema, 
            user_id=mock_current_user.id, 
            audio_file=mock_upload_file
        )
    assert exc_info.value.status_code == 500
    assert "Could not upload audio file" in exc_info.value.detail
    db_session_mock.add.assert_not_called()

async def test_create_pod_without_audio_success(db_session_mock, mock_current_user, mock_pod_create_schema):
    created_pod_db = await pod_service.create_pod(
        db=db_session_mock, 
        pod_data=mock_pod_create_schema, 
        user_id=mock_current_user.id, 
        audio_file=None
    )
    db_session_mock.add.assert_called_once()
    db_session_mock.commit.assert_called_once()
    db_session_mock.refresh.assert_called_once_with(db_session_mock.add.call_args[0][0])
    assert created_pod_db.audio_file_url is None

# --- Tests pour get_pod_by_id ---
def test_get_pod_by_id_found(db_session_mock, mock_existing_pod):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_pod
    pod = pod_service.get_pod_by_id(db=db_session_mock, pod_id=mock_existing_pod.id)
    assert pod == mock_existing_pod

def test_get_pod_by_id_not_found(db_session_mock):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None
    pod = pod_service.get_pod_by_id(db=db_session_mock, pod_id=999)
    assert pod is None

# --- Tests pour get_pods_by_user_id ---
def test_get_pods_by_user_id(db_session_mock, mock_existing_pod):
    db_session_mock.query.return_value.filter.return_value.offset.return_value.limit.return_value.all.return_value = [mock_existing_pod]
    pods = pod_service.get_pods_by_user_id(db=db_session_mock, user_id=1, skip=0, limit=10)
    assert len(pods) == 1
    assert pods[0] == mock_existing_pod

# --- Tests pour get_all_pods ---
def test_get_all_pods(db_session_mock, mock_existing_pod):
    db_session_mock.query.return_value.offset.return_value.limit.return_value.all.return_value = [mock_existing_pod]
    pods = pod_service.get_all_pods(db=db_session_mock, skip=0, limit=10)
    assert len(pods) == 1
    assert pods[0] == mock_existing_pod

# --- Tests pour update_pod ---
@patch("app.services.storage_service.upload_file_to_storage", new_callable=AsyncMock)
@patch("app.services.storage_service.delete_file_from_storage", new_callable=AsyncMock)
async def test_update_pod_with_new_audio(
    mock_delete_storage, 
    mock_upload_storage, 
    db_session_mock, 
    mock_existing_pod, 
    mock_upload_file
):
    mock_upload_storage.return_value = "http://example.com/new_audio.mp3"
    mock_delete_storage.return_value = True # Simuler la suppression réussie
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_pod
    update_data = pod_schema.PodUpdate(title="Titre Mis à Jour", description="Nouvelle description.")
    
    updated_pod = await pod_service.update_pod(
        db=db_session_mock, 
        pod_id=mock_existing_pod.id, 
        pod_update_data=update_data, 
        user_id=mock_existing_pod.owner_id,
        new_audio_file=mock_upload_file
    )

    assert updated_pod.title == "Titre Mis à Jour"
    assert updated_pod.description == "Nouvelle description."
    assert updated_pod.audio_file_url == "http://example.com/new_audio.mp3"
    if mock_existing_pod.audio_file_url: # Supprimer seulement si une URL existait
        mock_delete_storage.assert_called_once_with(mock_existing_pod.audio_file_url)
    else:
        mock_delete_storage.assert_not_called()
    mock_upload_storage.assert_called_once_with(file=mock_upload_file, user_id=mock_existing_pod.owner_id, pod_title=update_data.title)
    db_session_mock.commit.assert_called_once()
    db_session_mock.refresh.assert_called_once_with(mock_existing_pod)

async def test_update_pod_no_new_audio(db_session_mock, mock_existing_pod):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_pod
    update_data = pod_schema.PodUpdate(title="Autre Titre")
    
    updated_pod = await pod_service.update_pod(
        db=db_session_mock, 
        pod_id=mock_existing_pod.id, 
        pod_update_data=update_data, 
        user_id=mock_existing_pod.owner_id,
        new_audio_file=None
    )
    assert updated_pod.title == "Autre Titre"
    assert updated_pod.audio_file_url == mock_existing_pod.audio_file_url
    db_session_mock.commit.assert_called_once()
    db_session_mock.refresh.assert_called_once_with(mock_existing_pod)

async def test_update_pod_not_found(db_session_mock):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None
    update_data = pod_schema.PodUpdate(title="Nouveau Titre")
    with pytest.raises(HTTPException) as exc_info:
        await pod_service.update_pod(db_session_mock, 999, update_data, 1, None)
    assert exc_info.value.status_code == 404

async def test_update_pod_not_owner(db_session_mock, mock_existing_pod):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_pod
    update_data = pod_schema.PodUpdate(title="Nouveau Titre")
    with pytest.raises(HTTPException) as exc_info:
        await pod_service.update_pod(db_session_mock, mock_existing_pod.id, update_data, 99, None) # user_id 99 != owner_id
    assert exc_info.value.status_code == 403

# --- Tests pour delete_pod ---
@patch("app.services.storage_service.delete_file_from_storage", new_callable=AsyncMock)
async def test_delete_pod_success(mock_delete_storage, db_session_mock, mock_existing_pod):
    mock_delete_storage.return_value = True
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_pod
    
    deleted_pod = await pod_service.delete_pod(db=db_session_mock, pod_id=mock_existing_pod.id, user_id=mock_existing_pod.owner_id)
    
    if mock_existing_pod.audio_file_url:
        mock_delete_storage.assert_called_once_with(mock_existing_pod.audio_file_url)
    else:
        mock_delete_storage.assert_not_called()
    db_session_mock.delete.assert_called_once_with(mock_existing_pod)
    db_session_mock.commit.assert_called_once()
    assert deleted_pod == mock_existing_pod

async def test_delete_pod_no_audio_url(db_session_mock, mock_existing_pod):
    mock_existing_pod.audio_file_url = None
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_pod
    
    with patch("app.services.storage_service.delete_file_from_storage", new_callable=AsyncMock) as mock_delete_no_url:
        await pod_service.delete_pod(db=db_session_mock, pod_id=mock_existing_pod.id, user_id=mock_existing_pod.owner_id)
        mock_delete_no_url.assert_not_called()
    db_session_mock.delete.assert_called_once_with(mock_existing_pod)
    db_session_mock.commit.assert_called_once()

async def test_delete_pod_not_found(db_session_mock):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None
    with pytest.raises(HTTPException) as exc_info:
        await pod_service.delete_pod(db_session_mock, 999, 1)
    assert exc_info.value.status_code == 404

async def test_delete_pod_not_owner(db_session_mock, mock_existing_pod):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_pod
    with pytest.raises(HTTPException) as exc_info:
        await pod_service.delete_pod(db_session_mock, mock_existing_pod.id, 99) # user_id 99 != owner_id
    assert exc_info.value.status_code == 403

