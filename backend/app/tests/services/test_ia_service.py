# Tests pour le service ia_service.py

import pytest
from unittest.mock import MagicMock, patch, AsyncMock
import numpy as np

from sqlalchemy.orm import Session

# Supposons que vos modèles et schémas sont accessibles via ces chemins
# Ajustez les imports en fonction de la structure réelle de votre projet
from app.models import user_model, profile_model, pod_model
from app.schemas import profile_schema as s_profile
from app.services import ia_service

# --- Fixtures --- 
@pytest.fixture
def db_session_mock():
    """Crée un mock pour la session SQLAlchemy."""
    db = MagicMock(spec=Session)
    # Configurez ici le comportement de base du mock si nécessaire
    # Par exemple, pour simuler des requêtes qui retournent des objets mockés
    return db

@pytest.fixture
def mock_user_current():
    """Crée un mock pour l'utilisateur courant avec un profil."""
    user = MagicMock(spec=user_model.User)
    user.id = 1
    user.email = "test@example.com"
    user.full_name = "Test User"
    
    profile = MagicMock(spec=profile_model.Profile)
    profile.user_id = 1
    profile.disc_type = "D"
    profile.interests = ["technologie", "ia"]
    profile.objectives = "cherche collaborateur"
    profile.bio = "Bio de test"
    profile.profile_picture_url = "url_image.jpg"
    # Simuler la relation one-to-one ou one-to-many
    user.profile = [profile] # Si c'est une liste (relation one-to-many)
    # user.profile = profile # Si c'est un objet unique (relation one-to-one)
    return user

@pytest.fixture
def mock_user_other():
    """Crée un mock pour un autre utilisateur avec un profil."""
    user = MagicMock(spec=user_model.User)
    user.id = 2
    user.email = "other@example.com"
    user.full_name = "Other User"

    profile = MagicMock(spec=profile_model.Profile)
    profile.user_id = 2
    profile.disc_type = "I"
    profile.interests = ["ia", "musique"]
    profile.objectives = "cherche mentor"
    profile.bio = "Autre Bio"
    profile.profile_picture_url = "url_image2.jpg"
    user.profile = [profile]
    return user

@pytest.fixture
def mock_pod_user1_tech():
    pod = MagicMock(spec=pod_model.Pod)
    pod.id = 101
    pod.user_id = 1
    pod.title = "Pod Tech User 1"
    pod.transcription = "Ce pod parle de technologie et d'intelligence artificielle."
    pod.embedding = np.random.rand(384).tolist() # Exemple d'embedding pour all-MiniLM-L6-v2
    return pod

@pytest.fixture
def mock_pod_user2_music():
    pod = MagicMock(spec=pod_model.Pod)
    pod.id = 102
    pod.user_id = 2
    pod.title = "Pod Musique User 2"
    pod.transcription = "Ce pod explore différents genres de musique et leurs impacts."
    pod.embedding = np.random.rand(384).tolist()
    return pod

# --- Tests pour les fonctions d'embeddings (avec mocks pour les modèles externes) ---
@patch('app.services.ia_service.sbert_model')
def test_get_embedding_sbert_success(mock_sbert_model):
    mock_sbert_model.encode.return_value = np.array([0.1, 0.2, 0.3])
    text = "Ceci est un test."
    embedding = ia_service.get_embedding_sbert(text)
    assert embedding == [0.1, 0.2, 0.3]
    mock_sbert_model.encode.assert_called_once_with(text)

@patch('app.services.ia_service.sbert_model', None)
def test_get_embedding_sbert_model_not_loaded():
    text = "Ceci est un test."
    embedding = ia_service.get_embedding_sbert(text)
    assert embedding is None

# --- Tests pour les fonctions de calcul de score partiel ---
def test_calculate_disc_compatibility(mock_user_current, mock_user_other):
    profile1 = mock_user_current.profile[0]
    profile2 = mock_user_other.profile[0]
    score = ia_service.calculate_disc_compatibility(profile1, profile2)
    # Exemple: D et I sont différents mais pas opposés, score de 0.5
    assert score == 0.5 

    profile_same = MagicMock(spec=profile_model.Profile)
    profile_same.disc_type = "D"
    score_same = ia_service.calculate_disc_compatibility(profile1, profile_same)
    assert score_same == 1.0

def test_calculate_interests_similarity(mock_user_current, mock_user_other):
    profile1 = mock_user_current.profile[0]
    profile2 = mock_user_other.profile[0]
    # P1: ["technologie", "ia"], P2: ["ia", "musique"]
    # Commun: ["ia"] (1), Union: ["technologie", "ia", "musique"] (3)
    # Score = 1/3
    score = ia_service.calculate_interests_similarity(profile1, profile2)
    assert score == pytest.approx(1/3)

@pytest.mark.asyncio
@patch('app.services.ia_service.get_pod_embedding')
async def test_calculate_content_similarity(mock_get_pod_embedding, db_session_mock, mock_user_current, mock_user_other, mock_pod_user1_tech, mock_pod_user2_music):
    # Simuler les retours de la base de données
    db_session_mock.query.return_value.filter.side_effect = [
        MagicMock(all=lambda: [mock_pod_user1_tech]), # Pods de l'utilisateur 1
        MagicMock(all=lambda: [mock_pod_user2_music])  # Pods de l'utilisateur 2
    ]
    
    # Simuler les retours des embeddings
    # Embedding pour le pod de l'utilisateur 1
    emb1 = np.array([0.1, 0.2, 0.3, 0.4]) 
    # Embedding pour le pod de l'utilisateur 2
    emb2 = np.array([0.4, 0.3, 0.2, 0.1]) 
    mock_get_pod_embedding.side_effect = [emb1.tolist(), emb2.tolist()]

    score = await ia_service.calculate_content_similarity(db_session_mock, mock_user_current.id, mock_user_other.id)
    
    # Vérifier que cosine_similarity a été appelé avec les embeddings moyens
    # Le score exact dépendra des embeddings simulés. 
    # Ici, on s'attend à ce que la similarité cosinus soit calculée.
    # Par exemple, si les embeddings sont très différents, le score sera proche de 0.
    # Si emb1 et emb2 sont normalisés, le score est le produit scalaire.
    # Pour cet exemple, nous allons juste vérifier qu'un float est retourné.
    assert isinstance(score, float)
    assert 0.0 <= score <= 1.0
    # Vérifier que get_pod_embedding a été appelé pour chaque pod
    assert mock_get_pod_embedding.call_count == 2

def test_calculate_objectives_match(mock_user_current, mock_user_other):
    profile1 = mock_user_current.profile[0] # cherche collaborateur
    profile2 = mock_user_other.profile[0] # cherche mentor
    score = ia_service.calculate_objectives_match(profile1, profile2)
    assert score == 0.0 # Pas de match direct dans cet exemple simplifié

    profile_mentor_seeker = MagicMock(spec=profile_model.Profile)
    profile_mentor_seeker.objectives = "cherche mentor"
    profile_mentor_provider = MagicMock(spec=profile_model.Profile)
    profile_mentor_provider.objectives = "propose mentorat"
    score_match = ia_service.calculate_objectives_match(profile_mentor_seeker, profile_mentor_provider)
    assert score_match == 1.0

# --- Test pour le service de Matching Principal --- 
@pytest.mark.asyncio
@patch('app.services.ia_service.calculate_disc_compatibility', return_value=0.8)
@patch('app.services.ia_service.calculate_interests_similarity', return_value=0.6)
@patch('app.services.ia_service.calculate_content_similarity', new_callable=AsyncMock, return_value=0.7) # AsyncMock pour les fonctions async
@patch('app.services.ia_service.calculate_objectives_match', return_value=0.9)
async def test_find_ia_matches(
    mock_calc_objectives, mock_calc_content, mock_calc_interests, mock_calc_disc, 
    db_session_mock, mock_user_current, mock_user_other
):
    # Configurer les mocks de la base de données
    db_session_mock.query.return_value.filter.side_effect = [
        MagicMock(first=lambda: mock_user_current), # Pour current_user
        MagicMock(all=lambda: [mock_user_other])    # Pour all_other_users
    ]

    # Mock pour from_orm (utilisé dans la création du résultat)
    with patch('app.schemas.user_schema.User.from_orm', side_effect=lambda x: x) as mock_user_from_orm, \
         patch('app.schemas.profile_schema.Profile.from_orm', side_effect=lambda x: x) as mock_profile_from_orm:

        matches = await ia_service.find_ia_matches(db=db_session_mock, user_id=mock_user_current.id)

        assert len(matches) == 1
        match_result = matches[0]

        # Vérifier que les fonctions de calcul de score ont été appelées
        mock_calc_disc.assert_called_once_with(mock_user_current.profile[0], mock_user_other.profile[0])
        mock_calc_interests.assert_called_once_with(mock_user_current.profile[0], mock_user_other.profile[0])
        mock_calc_content.assert_called_once_with(db_session_mock, mock_user_current.id, mock_user_other.id, False)
        mock_calc_objectives.assert_called_once_with(mock_user_current.profile[0], mock_user_other.profile[0])

        # Vérifier le score global calculé (basé sur les retours mockés et les poids par défaut)
        # weights = {"disc": 0.3, "interests": 0.25, "content": 0.35, "objectives": 0.1}
        # expected_score = (0.3 * 0.8) + (0.25 * 0.6) + (0.35 * 0.7) + (0.1 * 0.9)
        # expected_score = 0.24 + 0.15 + 0.245 + 0.09 = 0.725
        assert match_result['match_score'] == pytest.approx(0.73) # 0.725 arrondi
        assert match_result['user'] == mock_user_other
        assert match_result['profile'] == mock_user_other.profile[0]
        assert mock_user_from_orm.called
        assert mock_profile_from_orm.called

@pytest.mark.asyncio
async def test_find_ia_matches_no_current_user(db_session_mock):
    db_session_mock.query.return_value.filter.return_value.first.return_value = None
    matches = await ia_service.find_ia_matches(db=db_session_mock, user_id=999)
    assert matches == []

# --- Tests pour get_ia_bot_response (simplifié) ---
@pytest.mark.asyncio
@patch('app.services.ia_service.OPENAI_API_KEY', 'test_key')
# Si vous décommentez l'appel OpenAI réel, vous devrez mocker openai.OpenAI().chat.completions.create
# @patch('openai.OpenAI') 
async def test_get_ia_bot_response_with_key(): # mock_openai_client
    # Pour l'instant, la fonction retourne une réponse simulée si le code OpenAI est commenté
    # mock_chat_completion = AsyncMock()
    # mock_chat_completion.choices = [MagicMock(message=MagicMock(content="Réponse IA réelle"))]
    # mock_openai_client.return_value.chat.completions.create = AsyncMock(return_value=mock_chat_completion)
    
    prompt = "Bonjour IA"
    response = await ia_service.get_ia_bot_response(prompt)
    assert "IA Bot (simulé)" in response['response']
    # Si l'appel OpenAI était actif et mocké:
    # assert response['response'] == "Réponse IA réelle"
    # mock_openai_client.return_value.chat.completions.create.assert_called_once()

@pytest.mark.asyncio
@patch('app.services.ia_service.OPENAI_API_KEY', None)
async def test_get_ia_bot_response_no_key():
    prompt = "Bonjour IA"
    response = await ia_service.get_ia_bot_response(prompt)
    assert response['error'] == "OpenAI API key not configured."

