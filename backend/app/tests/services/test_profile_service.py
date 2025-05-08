# Tests pour le service profile_service.py

import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.services import profile_service, disc_service # disc_service est utilisé par profile_service
from app.models import profile_model, user_model
from app.schemas import profile_schema, disc_schema

@pytest.fixture
def db_session_mock():
    db = MagicMock(spec=Session)
    return db

@pytest.fixture
def mock_current_user():
    user = user_model.User(id=1, email="test@example.com", full_name="Test User")
    return user

@pytest.fixture
def mock_profile_data_create():
    return profile_schema.ProfileCreate(
        bio="Une bio de test pour la création.",
        interests=["python", "fastapi"],
        skills=["développement", "test"],
        objectives="Apprendre et contribuer"
    )

@pytest.fixture
def mock_profile_data_update():
    return profile_schema.ProfileUpdate(
        bio="Bio mise à jour.",
        interests=["pytest", "docker"],
        profile_picture_url="http://example.com/new_pic.jpg"
    )

@pytest.fixture
def mock_existing_profile(mock_current_user):
    return profile_model.Profile(
        user_id=mock_current_user.id,
        bio="Bio existante.",
        profile_picture_url="http://example.com/pic.jpg",
        disc_type="D",
        disc_assessment_results={"D": 15, "I": 10, "S": 8, "C": 12},
        interests=["lecture"],
        skills=["communication"],
        objectives="Trouver un mentor"
    )

# --- Tests pour create_user_profile ---
def test_create_user_profile_success(db_session_mock, mock_current_user, mock_profile_data_create):
    created_profile = profile_service.create_user_profile(
        db=db_session_mock, 
        profile_data=mock_profile_data_create, 
        user_id=mock_current_user.id
    )
    
    db_session_mock.add.assert_called_once()
    db_session_mock.commit.assert_called_once()
    db_session_mock.refresh.assert_called_once()
    
    assert created_profile is not None
    assert created_profile.user_id == mock_current_user.id
    assert created_profile.bio == mock_profile_data_create.bio
    assert created_profile.interests == mock_profile_data_create.interests

def test_create_user_profile_already_exists(db_session_mock, mock_current_user, mock_profile_data_create, mock_existing_profile):
    # Simuler qu_un profil existe déjà pour cet utilisateur
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_profile
    
    with pytest.raises(HTTPException) as exc_info:
        profile_service.create_user_profile(
            db=db_session_mock, 
            profile_data=mock_profile_data_create, 
            user_id=mock_current_user.id
        )
    assert exc_info.value.status_code == 400
    assert "Profile already exists for this user." in exc_info.value.detail

# --- Tests pour get_user_profile ---
def test_get_user_profile_found(db_session_mock, mock_current_user, mock_existing_profile):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_profile
    profile = profile_service.get_user_profile(db=db_session_mock, user_id=mock_current_user.id)
    assert profile == mock_existing_profile

def test_get_user_profile_not_found(db_session_mock, mock_current_user):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None
    profile = profile_service.get_user_profile(db=db_session_mock, user_id=mock_current_user.id)
    assert profile is None

# --- Tests pour update_user_profile ---
def test_update_user_profile_success(db_session_mock, mock_current_user, mock_existing_profile, mock_profile_data_update):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_profile
    
    updated_profile = profile_service.update_user_profile(
        db=db_session_mock, 
        profile_update_data=mock_profile_data_update, 
        user_id=mock_current_user.id
    )
    
    assert updated_profile.bio == mock_profile_data_update.bio
    assert updated_profile.interests == mock_profile_data_update.interests
    assert updated_profile.profile_picture_url == mock_profile_data_update.profile_picture_url
    db_session_mock.commit.assert_called_once()
    db_session_mock.refresh.assert_called_once_with(mock_existing_profile)

def test_update_user_profile_creates_if_not_exists(db_session_mock, mock_current_user, mock_profile_data_update):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None # Profil non existant
    
    # Le service update_user_profile doit créer le profil s_il n_existe pas
    updated_profile = profile_service.update_user_profile(
        db=db_session_mock, 
        profile_update_data=mock_profile_data_update, 
        user_id=mock_current_user.id
    )
    
    db_session_mock.add.assert_called_once() # Vérifie que add a été appelé
    assert updated_profile is not None
    assert updated_profile.user_id == mock_current_user.id
    assert updated_profile.bio == mock_profile_data_update.bio

# --- Tests pour les fonctionnalités DISC intégrées dans profile_service ---

@patch("app.services.disc_service.get_disc_questions")
def test_get_disc_questionnaire_from_profile_service(mock_get_questions, db_session_mock):
    mock_questions_data = [
        disc_schema.DISCQuestion(id=1, text="Question 1?", category="D"),
        disc_schema.DISCQuestion(id=2, text="Question 2?", category="I"),
    ]
    mock_get_questions.return_value = mock_questions_data
    
    questions = profile_service.get_disc_questionnaire(db=db_session_mock) # db_session_mock n_est pas utilisé par disc_service.get_disc_questions
    
    assert questions == mock_questions_data
    mock_get_questions.assert_called_once()

@patch("app.services.disc_service.calculate_disc_profile")
def test_submit_disc_assessment_from_profile_service(
    mock_calculate_disc, 
    db_session_mock, 
    mock_current_user, 
    mock_existing_profile
):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_profile
    
    assessment_answers = disc_schema.DISCAssessmentRequest(
        answers=[{"question_id": 1, "answer": 3}, {"question_id": 2, "answer": 2}]
    )
    mock_disc_results = disc_schema.DISCResults(
        disc_type="I", 
        scores=disc_schema.DISCScores(D=5, I=15, S=10, C=8),
        raw_scores=disc_schema.DISCScores(D=5, I=15, S=10, C=8),
        summary="Influent dominant"
    )
    mock_calculate_disc.return_value = mock_disc_results
    
    results_response = profile_service.submit_disc_assessment(
        db=db_session_mock, 
        assessment_data=assessment_answers, 
        user_id=mock_current_user.id
    )
    
    mock_calculate_disc.assert_called_once_with(assessment_answers.answers)
    assert mock_existing_profile.disc_type == mock_disc_results.disc_type
    assert mock_existing_profile.disc_assessment_results == mock_disc_results.scores.dict() # ou .model_dump()
    db_session_mock.commit.assert_called_once()
    db_session_mock.refresh.assert_called_once_with(mock_existing_profile)
    
    assert results_response.disc_type == mock_disc_results.disc_type
    assert results_response.scores == mock_disc_results.scores

def test_submit_disc_assessment_profile_not_found(db_session_mock, mock_current_user):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None # Profil non trouvé
    assessment_answers = disc_schema.DISCAssessmentRequest(answers=[])
    
    with pytest.raises(HTTPException) as exc_info:
        profile_service.submit_disc_assessment(
            db=db_session_mock, 
            assessment_data=assessment_answers, 
            user_id=mock_current_user.id
        )
    assert exc_info.value.status_code == 404
    assert "Profile not found for this user. Please create a profile first." in exc_info.value.detail

def test_get_disc_results_from_profile_service_found(db_session_mock, mock_current_user, mock_existing_profile):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_profile
    mock_existing_profile.disc_type = "S"
    mock_existing_profile.disc_assessment_results = {"D": 5, "I": 8, "S": 15, "C": 10}
    
    results = profile_service.get_disc_results(db=db_session_mock, user_id=mock_current_user.id)
    
    assert results is not None
    assert results.disc_type == "S"
    assert results.scores.S == 15

def test_get_disc_results_profile_not_found(db_session_mock, mock_current_user):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None
    with pytest.raises(HTTPException) as exc_info:
        profile_service.get_disc_results(db=db_session_mock, user_id=mock_current_user.id)
    assert exc_info.value.status_code == 404
    assert "Profile not found for this user." in exc_info.value.detail

def test_get_disc_results_no_assessment_done(db_session_mock, mock_current_user, mock_existing_profile):
    mock_existing_profile.disc_type = None # Pas d_évaluation faite
    mock_existing_profile.disc_assessment_results = None
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_profile
    
    with pytest.raises(HTTPException) as exc_info:
        profile_service.get_disc_results(db=db_session_mock, user_id=mock_current_user.id)
    assert exc_info.value.status_code == 404
    assert "DISC assessment not yet completed for this user." in exc_info.value.detail

