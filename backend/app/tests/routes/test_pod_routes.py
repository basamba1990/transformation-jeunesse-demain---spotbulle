# Tests pour les routes des pods (pod_routes.py)

import pytest
from fastapi import HTTPException # Ajout de l_import manquant
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import patch, MagicMock, AsyncMock, ANY
import io

from app.main import app # L_application FastAPI principale
from app.models import user_model, pod_model # Assurez-vous que ces modules existent et sont importables
from app.schemas import pod_schema
from app.dependencies import get_db # get_current_active_user est mocké directement dans les tests

# --- Configuration du client de test et des mocks de base de données ---
@pytest.fixture
def db_session_mock_for_pod_routes():
    db = MagicMock(spec=Session)
    return db

@pytest.fixture(autouse=True)
def override_get_db_for_pods(db_session_mock_for_pod_routes):
    app.dependency_overrides[get_db] = lambda: db_session_mock_for_pod_routes
    yield
    app.dependency_overrides.clear()

client = TestClient(app)

# --- Fixtures pour les données utilisateur et pod ---
@pytest.fixture
def mock_auth_user():
    user = user_model.User(id=1, email="authtest@example.com", full_name="Auth User", is_active=True)
    return user

@pytest.fixture
def mock_pod_data_for_route(mock_auth_user): # Le pod a besoin d_un owner_id
    return pod_model.Pod(
        id=1,
        title="Test Pod from Route",
        description="Description for route test.",
        audio_file_url="http://example.com/test_route.mp3",
        transcription="Transcription test.",
        owner_id=mock_auth_user.id, # Utiliser l_id de l_utilisateur mocké
        tags=["route", "test"]
    )

# --- Tests pour POST /pods/ ---
@patch("app.routes.pod_routes.get_current_active_user")
@patch("app.services.pod_service.create_pod", new_callable=AsyncMock)
async def test_create_new_pod_with_audio(mock_create_pod_service, mock_get_current_active_user, mock_auth_user, mock_pod_data_for_route, db_session_mock_for_pod_routes):
    mock_get_current_active_user.return_value = mock_auth_user
    mock_create_pod_service.return_value = mock_pod_data_for_route

    file_content = b"dummy audio content for route test"
    files = {"audio_file": ("test_audio_route.mp3", io.BytesIO(file_content), "audio/mpeg")}
    data = {"title": "Test Pod Title", "description": "Test Pod Description", "tags_json": "[\"tag1\", \"tag2\"]"}

    response = client.post("/api/v1/pods/", files=files, data=data, headers={"Authorization": "Bearer faketoken"})
    
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["title"] == mock_pod_data_for_route.title
    assert json_response["id"] == mock_pod_data_for_route.id
    mock_create_pod_service.assert_called_once()
    call_args = mock_create_pod_service.call_args[0]
    assert call_args[0] == db_session_mock_for_pod_routes
    assert isinstance(call_args[1], pod_schema.PodCreate)
    assert call_args[1].title == "Test Pod Title"
    assert call_args[2] == mock_auth_user.id
    assert call_args[3].filename == "test_audio_route.mp3"

@patch("app.routes.pod_routes.get_current_active_user")
@patch("app.services.pod_service.create_pod", new_callable=AsyncMock)
async def test_create_new_pod_without_audio(mock_create_pod_service, mock_get_current_active_user, mock_auth_user, mock_pod_data_for_route, db_session_mock_for_pod_routes):
    mock_get_current_active_user.return_value = mock_auth_user
    # Simuler un pod créé sans audio, le service devrait gérer cela
    created_pod_without_audio = pod_model.Pod(
        id=mock_pod_data_for_route.id + 1, # ID différent pour éviter les conflits
        title="No Audio Pod", 
        description="Description", 
        owner_id=mock_auth_user.id, 
        tags=["notag"],
        audio_file_url=None # Important
    )
    mock_create_pod_service.return_value = created_pod_without_audio

    data = {"title": "No Audio Pod", "description": "Description", "tags_json": "[\"notag\"]"}
    response = client.post("/api/v1/pods/", data=data, headers={"Authorization": "Bearer faketoken"})

    assert response.status_code == 200
    assert response.json()["audio_file_url"] is None
    assert response.json()["title"] == "No Audio Pod"
    mock_create_pod_service.assert_called_once()
    call_args = mock_create_pod_service.call_args[0]
    assert call_args[3] is None # audio_file est None

# --- Tests pour GET /pods/ ---
@patch("app.services.pod_service.get_all_pods")
def test_read_all_pods(mock_get_all, mock_pod_data_for_route, db_session_mock_for_pod_routes):
    mock_get_all.return_value = [mock_pod_data_for_route]
    response = client.get("/api/v1/pods/")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == mock_pod_data_for_route.title
    mock_get_all.assert_called_once_with(db=db_session_mock_for_pod_routes, skip=0, limit=10)

# --- Tests pour GET /pods/mine ---
@patch("app.routes.pod_routes.get_current_active_user")
@patch("app.services.pod_service.get_pods_by_user_id")
def test_read_my_pods(mock_get_pods_by_user, mock_get_current_active_user, mock_auth_user, mock_pod_data_for_route, db_session_mock_for_pod_routes):
    mock_get_current_active_user.return_value = mock_auth_user
    mock_get_pods_by_user.return_value = [mock_pod_data_for_route]
    response = client.get("/api/v1/pods/mine", headers={"Authorization": "Bearer faketoken"})
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["owner_id"] == mock_auth_user.id
    mock_get_pods_by_user.assert_called_once_with(db=db_session_mock_for_pod_routes, user_id=mock_auth_user.id, skip=0, limit=10)

# --- Tests pour GET /pods/{pod_id} ---
@patch("app.services.pod_service.get_pod_by_id")
def test_read_pod_by_id_found(mock_get_by_id, mock_pod_data_for_route, db_session_mock_for_pod_routes):
    mock_get_by_id.return_value = mock_pod_data_for_route
    response = client.get(f"/api/v1/pods/{mock_pod_data_for_route.id}")
    assert response.status_code == 200
    assert response.json()["title"] == mock_pod_data_for_route.title
    mock_get_by_id.assert_called_once_with(db=db_session_mock_for_pod_routes, pod_id=mock_pod_data_for_route.id)

@patch("app.services.pod_service.get_pod_by_id")
def test_read_pod_by_id_not_found(mock_get_by_id, db_session_mock_for_pod_routes):
    mock_get_by_id.return_value = None
    response = client.get("/api/v1/pods/999")
    assert response.status_code == 404
    assert response.json() == {"detail": "Pod not found"}

# --- Tests pour PUT /pods/{pod_id} ---
@patch("app.routes.pod_routes.get_current_active_user")
@patch("app.services.pod_service.update_pod", new_callable=AsyncMock)
async def test_update_existing_pod(mock_update_pod_service, mock_get_current_active_user, mock_auth_user, mock_pod_data_for_route, db_session_mock_for_pod_routes):
    mock_get_current_active_user.return_value = mock_auth_user
    updated_pod_mock = MagicMock(spec=pod_model.Pod)
    updated_pod_mock.id = mock_pod_data_for_route.id
    updated_pod_mock.title = "Updated Title via Route"
    updated_pod_mock.description = mock_pod_data_for_route.description
    updated_pod_mock.audio_file_url = mock_pod_data_for_route.audio_file_url
    updated_pod_mock.owner_id = mock_auth_user.id
    updated_pod_mock.tags = ["updated"]

    mock_update_pod_service.return_value = updated_pod_mock

    data = {"title": "Updated Title via Route", "tags_json": "[\"updated\"]"}
    response = client.put(f"/api/v1/pods/{mock_pod_data_for_route.id}", data=data, headers={"Authorization": "Bearer faketoken"})

    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title via Route"
    mock_update_pod_service.assert_called_once()
    call_args = mock_update_pod_service.call_args[0]
    assert call_args[0] == db_session_mock_for_pod_routes
    assert call_args[1] == mock_pod_data_for_route.id
    assert isinstance(call_args[2], pod_schema.PodUpdate)
    assert call_args[2].title == "Updated Title via Route"
    assert call_args[3] == mock_auth_user.id
    assert call_args[4] is None

# --- Tests pour DELETE /pods/{pod_id} ---
@patch("app.routes.pod_routes.get_current_active_user")
@patch("app.services.pod_service.delete_pod", new_callable=AsyncMock)
async def test_delete_existing_pod(mock_delete_pod_service, mock_get_current_active_user, mock_auth_user, mock_pod_data_for_route, db_session_mock_for_pod_routes):
    mock_get_current_active_user.return_value = mock_auth_user
    mock_delete_pod_service.return_value = mock_pod_data_for_route

    response = client.delete(f"/api/v1/pods/{mock_pod_data_for_route.id}", headers={"Authorization": "Bearer faketoken"})

    assert response.status_code == 200
    assert response.json()["title"] == mock_pod_data_for_route.title
    mock_delete_pod_service.assert_called_once_with(db=db_session_mock_for_pod_routes, pod_id=mock_pod_data_for_route.id, user_id=mock_auth_user.id)

# --- Tests pour POST /pods/{pod_id}/transcribe ---
@patch("app.routes.pod_routes.get_current_active_user")
@patch("app.services.transcription_service.request_transcription", new_callable=AsyncMock)
async def test_transcribe_pod_route(mock_request_transcription, mock_get_current_active_user, mock_auth_user, mock_pod_data_for_route, db_session_mock_for_pod_routes):
    mock_get_current_active_user.return_value = mock_auth_user
    transcribed_pod_mock = MagicMock(spec=pod_model.Pod)
    transcribed_pod_mock.id = mock_pod_data_for_route.id
    transcribed_pod_mock.title = mock_pod_data_for_route.title
    transcribed_pod_mock.transcription = "Ceci est une transcription de test."
    mock_request_transcription.return_value = transcribed_pod_mock

    response = client.post(f"/api/v1/pods/{mock_pod_data_for_route.id}/transcribe", headers={"Authorization": "Bearer faketoken"})

    assert response.status_code == 200
    assert response.json()["transcription"] == "Ceci est une transcription de test."
    mock_request_transcription.assert_called_once_with(db=db_session_mock_for_pod_routes, pod_id=mock_pod_data_for_route.id, user_id=mock_auth_user.id)

