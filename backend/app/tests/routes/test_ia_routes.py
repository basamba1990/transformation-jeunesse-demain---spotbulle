# Tests pour les routes IA (ia_routes.py)

import pytest
from fastapi import HTTPException # Ajout de l_import manquant
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import patch, MagicMock, AsyncMock, ANY

from app.main import app # L_application FastAPI principale
from app.models import user_model # Assurez-vous que cela importe correctement User
from app.schemas import user_schema # Pour UserPrompt
from app.dependencies import get_db # get_current_active_user est importé et mocké directement dans les tests

# --- Configuration du client de test et des mocks de base de données ---
@pytest.fixture
def db_session_mock_for_ia_routes():
    db = MagicMock(spec=Session)
    return db

@pytest.fixture(autouse=True)
def override_get_db_for_ia(db_session_mock_for_ia_routes):
    app.dependency_overrides[get_db] = lambda: db_session_mock_for_ia_routes
    yield
    app.dependency_overrides.clear()

client = TestClient(app)

# --- Fixtures pour les données utilisateur ---
@pytest.fixture
def mock_auth_user_for_ia():
    # Utiliser le modèle User directement depuis user_model
    user = user_model.User(id=1, email="ia_test@example.com", full_name="IA Test User", is_active=True)
    profile = MagicMock()
    profile.disc_type = "D"
    profile.interests = ["ia"]
    profile.objectives = "test"
    # Simuler la relation de profil. En SQLAlchemy, c_est souvent une liste ou un objet unique.
    # Si profile est une relation one-to-one, user.profile = profile
    # Si profile est une relation one-to-many (improbable pour un profil principal), user.profile = [profile]
    # Pour les tests, il est important que cela corresponde à la manière dont le service accède au profil.
    # Supposons que le service accède à user.profile (one-to-one) ou user.profile[0] (one-to-many)
    # Pour simplifier, si le service attend user.profile.disc_type, alors user.profile = profile est correct.
    user.profile = profile # Assumant une relation one-to-one pour le profil principal
    return user

# --- Tests pour GET /ia/matches ---
@patch("app.routes.ia_routes.get_current_active_user") # Mock la dépendance directement dans la route
@patch("app.services.ia_service.find_ia_matches", new_callable=AsyncMock)
async def test_get_user_matches_success(
    mock_find_ia_matches, 
    mock_get_current_active_user, # Renommé pour correspondre au patch
    mock_auth_user_for_ia, 
    db_session_mock_for_ia_routes
):
    mock_get_current_active_user.return_value = mock_auth_user_for_ia
    mock_match_data = [
        {
            "user": {"id": 2, "email": "match1@example.com", "full_name": "Match User 1"},
            "profile": {"bio": "Bio Match 1", "disc_type": "I"},
            "match_score": 0.85,
            "score_details": { "disc_score": 0.8, "interests_score": 0.7, "content_score": 0.9, "objectives_score": 1.0, "overall_score": 0.85},
            "match_reason": "Good overall match"
        }
    ]
    mock_find_ia_matches.return_value = mock_match_data

    response = client.get("/api/v1/ia/matches?limit=5&use_openai_embeddings=false", headers={"Authorization": "Bearer faketoken"})

    assert response.status_code == 200
    json_response = response.json()
    assert len(json_response) == 1
    assert json_response[0]["user"]["email"] == "match1@example.com"
    assert json_response[0]["match_score"] == 0.85
    
    mock_find_ia_matches.assert_called_once_with(
        db=db_session_mock_for_ia_routes, 
        user_id=mock_auth_user_for_ia.id, 
        limit=5, 
        use_openai_embeddings=False
    )

@patch("app.routes.ia_routes.get_current_active_user")
@patch("app.services.ia_service.find_ia_matches", new_callable=AsyncMock, return_value=[])
async def test_get_user_matches_no_matches(mock_find_ia_matches, mock_get_current_active_user, mock_auth_user_for_ia):
    mock_get_current_active_user.return_value = mock_auth_user_for_ia
    response = client.get("/api/v1/ia/matches", headers={"Authorization": "Bearer faketoken"})
    assert response.status_code == 200
    assert response.json() == []

@patch("app.routes.ia_routes.get_current_active_user")
async def test_get_user_matches_not_authenticated(mock_get_current_active_user):
    mock_get_current_active_user.side_effect = HTTPException(status_code=401, detail="Not authenticated")
    response = client.get("/api/v1/ia/matches") # Pas de header d_auth
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]

# --- Tests pour POST /ia/bot/chat ---
@patch("app.routes.ia_routes.get_current_active_user")
@patch("app.services.ia_service.get_ia_bot_response", new_callable=AsyncMock)
async def test_chat_with_ia_bot_success(
    mock_get_bot_response, 
    mock_get_current_active_user, 
    mock_auth_user_for_ia
):
    mock_get_current_active_user.return_value = mock_auth_user_for_ia
    mock_bot_reply = {"response": "Bonjour! Ceci est une réponse du bot IA."}
    mock_get_bot_response.return_value = mock_bot_reply

    prompt_data = {"prompt": "Salut BotIA"}
    response = client.post("/api/v1/ia/bot/chat", json=prompt_data, headers={"Authorization": "Bearer faketoken"})

    assert response.status_code == 200
    assert response.json() == mock_bot_reply
    mock_get_bot_response.assert_called_once_with(db=ANY, prompt=prompt_data["prompt"], user_id=mock_auth_user_for_ia.id)

@patch("app.routes.ia_routes.get_current_active_user")
@patch("app.services.ia_service.get_ia_bot_response", new_callable=AsyncMock)
async def test_chat_with_ia_bot_openai_error(
    mock_get_bot_response, 
    mock_get_current_active_user, 
    mock_auth_user_for_ia
):
    mock_get_current_active_user.return_value = mock_auth_user_for_ia
    # Simuler une erreur venant du service, par exemple une HTTPException
    mock_get_bot_response.side_effect = HTTPException(status_code=503, detail="OpenAI API error")

    prompt_data = {"prompt": "Test erreur OpenAI"}
    response = client.post("/api/v1/ia/bot/chat", json=prompt_data, headers={"Authorization": "Bearer faketoken"})

    assert response.status_code == 503 
    assert response.json() == {"detail": "OpenAI API error"}

@patch("app.routes.ia_routes.get_current_active_user")
async def test_chat_with_ia_bot_not_authenticated(mock_get_current_active_user):
    mock_get_current_active_user.side_effect = HTTPException(status_code=401, detail="Not authenticated")
    prompt_data = {"prompt": "N_importe quoi"}
    response = client.post("/api/v1/ia/bot/chat", json=prompt_data) # Pas de header d_auth
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]

