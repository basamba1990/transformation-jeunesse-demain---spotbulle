# Tests pour les routes d'authentification (auth_routes.py)

import pytest
from fastapi import HTTPException # Ajout de l'import manquant
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import patch, MagicMock, ANY

from app.main import app # L'application FastAPI principale
from app.models import user_model # Tentative d'importation du module user_model
from app.services import user_service # Utilisé pour mocker
from app.utils import security
from app.dependencies import get_db # Pour surcharger la dépendance de base de données

# --- Configuration du client de test et des mocks de base de données ---

@pytest.fixture
def db_session_mock_for_routes():
    db = MagicMock(spec=Session)
    return db

@pytest.fixture(autouse=True)
def override_get_db(db_session_mock_for_routes):
    app.dependency_overrides[get_db] = lambda: db_session_mock_for_routes
    yield
    app.dependency_overrides.clear()

client = TestClient(app)

# --- Fixtures pour les données utilisateur et tokens ---
@pytest.fixture
def test_user_data():
    return {
        "email": "testregister@example.com",
        "password": "testpassword123",
        "full_name": "Test Register User"
    }

@pytest.fixture
def mock_registered_user(test_user_data):
    # Assumant que user_model.User est la classe modèle
    return user_model.User(
        id=1,
        email=test_user_data["email"],
        hashed_password=security.get_password_hash(test_user_data["password"]),
        full_name=test_user_data["full_name"],
        is_active=True,
        is_superuser=False
    )

@pytest.fixture
def mock_access_token():
    return "mock_access_token_value"

# --- Tests pour POST /auth/register ---
@patch("app.services.user_service.create_user")
@patch("app.services.profile_service.create_user_profile")
def test_register_user_success(mock_create_profile, mock_create_user, test_user_data, mock_registered_user, db_session_mock_for_routes):
    mock_create_user.return_value = mock_registered_user
    mock_create_profile.return_value = MagicMock()

    response = client.post("/api/v1/auth/register", json=test_user_data)
    
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["email"] == test_user_data["email"]
    assert json_response["full_name"] == test_user_data["full_name"]
    assert "id" in json_response
    mock_create_user.assert_called_once()
    # mock_create_profile.assert_called_once() # Dépend si c'est appelé dans la route

@patch("app.services.user_service.create_user")
def test_register_user_email_exists(mock_create_user, test_user_data):
    mock_create_user.side_effect = HTTPException(status_code=400, detail="Email already registered")
    response = client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == 400
    assert response.json() == {"detail": "Email already registered"}

# --- Tests pour POST /auth/token ---
@patch("app.services.user_service.authenticate_user")
@patch("app.utils.security.create_access_token")
def test_login_for_access_token_success(
    mock_create_access_token, 
    mock_authenticate_user, 
    mock_registered_user, 
    mock_access_token,
    db_session_mock_for_routes # Assurez-vous que le mock de session est utilisé
):
    mock_authenticate_user.return_value = mock_registered_user
    mock_create_access_token.return_value = mock_access_token
    
    login_data = {"username": mock_registered_user.email, "password": "testpassword123"}
    response = client.post("/api/v1/auth/token", data=login_data)
    
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["access_token"] == mock_access_token
    assert json_response["token_type"] == "bearer"
    # Utiliser ANY pour db car la session mockée est injectée via la dépendance surchargée
    mock_authenticate_user.assert_called_once_with(db=ANY, email=login_data["username"], password=login_data["password"])
    mock_create_access_token.assert_called_once()

@patch("app.services.user_service.authenticate_user")
def test_login_for_access_token_incorrect_credentials(mock_authenticate_user, db_session_mock_for_routes):
    mock_authenticate_user.return_value = False # Ou lever une HTTPException appropriée
    login_data = {"username": "wrong@example.com", "password": "wrongpassword"}
    response = client.post("/api/v1/auth/token", data=login_data)
    
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

# --- Tests pour GET /auth/users/me ---
@patch("app.routes.auth_routes.get_current_active_user")
def test_read_users_me_success(mock_get_current_active_user, mock_registered_user):
    mock_get_current_active_user.return_value = mock_registered_user
    
    response = client.get("/api/v1/auth/users/me", headers={"Authorization": "Bearer faketoken"})
    
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["email"] == mock_registered_user.email
    assert json_response["full_name"] == mock_registered_user.full_name
    assert json_response["id"] == mock_registered_user.id

@patch("app.routes.auth_routes.get_current_active_user")
def test_read_users_me_not_authenticated(mock_get_current_active_user):
    mock_get_current_active_user.side_effect = HTTPException(status_code=401, detail="Not authenticated")
    response = client.get("/api/v1/auth/users/me")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]

