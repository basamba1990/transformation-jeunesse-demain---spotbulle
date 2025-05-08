# Tests pour le service user_service.py

import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.services import user_service
from app.models import user_model
from app.schemas import user_schema
from app.utils import security

@pytest.fixture
def db_session_mock():
    db = MagicMock(spec=Session)
    return db

@pytest.fixture
def mock_user_data():
    return user_schema.UserCreate(
        email="test@example.com", 
        password="password123", 
        full_name="Test User"
    )

@pytest.fixture
def mock_existing_user():
    user = user_model.User(
        id=1,
        email="existing@example.com",
        hashed_password=security.get_password_hash("existingpass"),
        full_name="Existing User",
        is_active=True,
        is_superuser=False
    )
    return user

# --- Tests pour get_user_by_email ---
def test_get_user_by_email_found(db_session_mock, mock_existing_user):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_user
    user = user_service.get_user_by_email(db_session_mock, email="existing@example.com")
    assert user is not None
    assert user.email == "existing@example.com"
    db_session_mock.query.assert_called_once_with(user_model.User)

def test_get_user_by_email_not_found(db_session_mock):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None
    user = user_service.get_user_by_email(db_session_mock, email="nonexistent@example.com")
    assert user is None

# --- Tests pour create_user ---
@patch("app.utils.security.get_password_hash", return_value="hashed_password_value")
def test_create_user_success(mock_get_password_hash, db_session_mock, mock_user_data):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None # No existing user
    
    created_user = user_service.create_user(db_session_mock, user=mock_user_data)
    
    mock_get_password_hash.assert_called_once_with(mock_user_data.password)
    db_session_mock.add.assert_called_once()
    db_session_mock.commit.assert_called_once()
    db_session_mock.refresh.assert_called_once()
    
    assert created_user is not None
    assert created_user.email == mock_user_data.email
    assert created_user.full_name == mock_user_data.full_name
    assert created_user.hashed_password == "hashed_password_value"
    assert created_user.is_active is True # Default value

def test_create_user_email_exists(db_session_mock, mock_user_data, mock_existing_user):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_user
    with pytest.raises(HTTPException) as exc_info:
        user_service.create_user(db_session_mock, user=mock_user_data)
    assert exc_info.value.status_code == 400
    assert "Email already registered" in exc_info.value.detail

# --- Tests pour get_user --- (get_user_by_id)
def test_get_user_by_id_found(db_session_mock, mock_existing_user):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_user
    user = user_service.get_user(db_session_mock, user_id=1)
    assert user is not None
    assert user.id == 1

def test_get_user_by_id_not_found(db_session_mock):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None
    user = user_service.get_user(db_session_mock, user_id=999)
    assert user is None

# --- Tests pour update_user ---
@patch("app.utils.security.get_password_hash", return_value="new_hashed_password")
def test_update_user_success(mock_get_password_hash, db_session_mock, mock_existing_user):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_user
    
    update_data = user_schema.UserUpdate(
        full_name="Updated Test User", 
        password="newpassword123"
    )
    
    updated_user = user_service.update_user(db_session_mock, user_id=mock_existing_user.id, user_update=update_data)
    
    assert updated_user.full_name == "Updated Test User"
    assert updated_user.hashed_password == "new_hashed_password"
    mock_get_password_hash.assert_called_once_with("newpassword123")
    db_session_mock.commit.assert_called_once()
    db_session_mock.refresh.assert_called_once_with(mock_existing_user)

def test_update_user_not_found(db_session_mock):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None
    update_data = user_schema.UserUpdate(full_name="Updated Name")
    
    with pytest.raises(HTTPException) as exc_info:
        user_service.update_user(db_session_mock, user_id=999, user_update=update_data)
    assert exc_info.value.status_code == 404
    assert "User not found" in exc_info.value.detail

# --- Tests pour delete_user ---
def test_delete_user_success(db_session_mock, mock_existing_user):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_user
    
    deleted_user = user_service.delete_user(db_session_mock, user_id=mock_existing_user.id)
    
    db_session_mock.delete.assert_called_once_with(mock_existing_user)
    db_session_mock.commit.assert_called_once()
    assert deleted_user == mock_existing_user

def test_delete_user_not_found(db_session_mock):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None
    with pytest.raises(HTTPException) as exc_info:
        user_service.delete_user(db_session_mock, user_id=999)
    assert exc_info.value.status_code == 404
    assert "User not found" in exc_info.value.detail

# --- Tests pour authenticate_user ---
@patch("app.utils.security.verify_password", return_value=True)
def test_authenticate_user_success(mock_verify_password, db_session_mock, mock_existing_user):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_user
    
    authenticated_user = user_service.authenticate_user(db_session_mock, email="existing@example.com", password="existingpass")
    
    assert authenticated_user == mock_existing_user
    mock_verify_password.assert_called_once_with("existingpass", mock_existing_user.hashed_password)

@patch("app.utils.security.verify_password", return_value=False)
def test_authenticate_user_wrong_password(mock_verify_password, db_session_mock, mock_existing_user):
    db_session_mock.query.return_value.filter.return_value.first.return_value = mock_existing_user
    
    authenticated_user = user_service.authenticate_user(db_session_mock, email="existing@example.com", password="wrongpass")
    
    assert authenticated_user is False
    mock_verify_password.assert_called_once_with("wrongpass", mock_existing_user.hashed_password)

def test_authenticate_user_not_found(db_session_mock):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None
    
    authenticated_user = user_service.authenticate_user(db_session_mock, email="nonexistent@example.com", password="anypass")
    
    assert authenticated_user is False

