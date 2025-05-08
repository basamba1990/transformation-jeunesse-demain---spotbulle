# backend/app/services/disc_service.py

from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List, Tuple

from ..models import profile_model
from ..schemas import profile_schema # Assurez-vous que ce schéma peut gérer les résultats DISC structurés

# --- Définition du Questionnaire DISC ---
# Chaque question est un dictionnaire avec un ID et 4 affirmations.
# Chaque affirmation est un tuple: (texte_affirmation, trait_DISC_associé)
# Nous aurons besoin d'un ensemble de questions. Pour l'exemple, nous en définissons quelques-unes.
# Un questionnaire complet en contiendrait typiquement 24-28.

DISC_QUESTIONS = [
    {
        "id": 1,
        "affirmations": [
            ("Je suis une personne directe et je vais droit au but.", "D"),
            ("J'aime interagir avec les autres et les motiver.", "I"),
            ("Je préfère travailler dans un environnement stable et prévisible.", "S"),
            ("J'accorde une grande importance aux détails et à la précision.", "C")
        ]
    },
    {
        "id": 2,
        "affirmations": [
            ("Je prends des risques pour atteindre mes objectifs.", "D"),
            ("Je suis optimiste et j'inspire les autres.", "I"),
            ("Je suis loyal(e) et je soutiens mes collègues.", "S"),
            ("J'aime suivre les règles et les procédures.", "C")
        ]
    },
    {
        "id": 3,
        "affirmations": [
            ("Je suis orienté(e) vers les résultats et la compétition.", "D"),
            ("Je suis sociable et j'aime rencontrer de nouvelles personnes.", "I"),
            ("Je suis patient(e) et méthodique dans mon travail.", "S"),
            ("Je suis analytique et je base mes décisions sur des faits.", "C")
        ]
    },
    # Ajoutez ici jusqu'à 28 questions pour un test complet.
    # Pour cet exemple, nous allons nous limiter à 3 questions pour la démonstration du scoring.
    # Dans une vraie application, ces questions seraient stockées de manière plus robuste,
    # potentiellement dans la base de données ou un fichier de configuration dédié.
]

# Nombre total de questions utilisées pour le calcul (à ajuster si plus de questions sont ajoutées)
TOTAL_QUESTIONS_FOR_SCORING = len(DISC_QUESTIONS)

def calculate_disc_scores(answers: List[Dict[str, int]]) -> Dict[str, int]:
    """
    Calcule les scores DISC bruts basés sur les réponses de l'utilisateur.
    Chaque réponse dans 'answers' devrait être un dict comme:
    { "question_id": 1, "most_choice_index": 0, "least_choice_index": 2 }
    où les index correspondent aux affirmations dans DISC_QUESTIONS.
    """
    raw_scores = {"D": 0, "I": 0, "S": 0, "C": 0}

    for answer in answers:
        question_id = answer.get("question_id")
        most_choice_idx = answer.get("most_choice_index")
        least_choice_idx = answer.get("least_choice_index")

        question = next((q for q in DISC_QUESTIONS if q["id"] == question_id), None)

        if question and most_choice_idx is not None and least_choice_idx is not None:
            if 0 <= most_choice_idx < len(question["affirmations"]):
                _, most_trait = question["affirmations"][most_choice_idx]
                raw_scores[most_trait] += 2
            
            if 0 <= least_choice_idx < len(question["affirmations"]):
                _, least_trait = question["affirmations"][least_choice_idx]
                raw_scores[least_trait] -= 1
    
    return raw_scores

def normalize_scores(raw_scores: Dict[str, int]) -> Dict[str, int]:
    """
    Normalise les scores bruts sur une échelle de 0 à 100.
    Cette normalisation est une simplification. Une normalisation psychométrique
    nécessiterait un étalonnage sur une population de référence.
    
    Pour cette version, nous allons considérer que le score max brut possible par trait est
    TOTAL_QUESTIONS_FOR_SCORING * 2 (si toutes les réponses "le plus" vont vers ce trait)
    et le score min brut est TOTAL_QUESTIONS_FOR_SCORING * -1 (si toutes les "le moins" vont vers ce trait).
    L'étendue est donc de TOTAL_QUESTIONS_FOR_SCORING * 3.
    Nous allons mapper cette étendue à 0-100.
    Score normalisé = ((Score Brut - Min Brut) / (Max Brut - Min Brut)) * 100
    Min Brut par trait = TOTAL_QUESTIONS_FOR_SCORING * -1
    Max Brut par trait = TOTAL_QUESTIONS_FOR_SCORING * 2
    """
    normalized_scores = {}
    min_raw_score_per_trait = TOTAL_QUESTIONS_FOR_SCORING * -1
    max_raw_score_per_trait = TOTAL_QUESTIONS_FOR_SCORING * 2
    raw_score_range = max_raw_score_per_trait - min_raw_score_per_trait

    if raw_score_range == 0: # Évite la division par zéro si TOTAL_QUESTIONS_FOR_SCORING est 0
        return {trait: 50 for trait in raw_scores} # Retourne une valeur neutre

    for trait, score in raw_scores.items():
        # S'assurer que le score est dans les bornes avant normalisation pour éviter des résultats > 100 ou < 0
        clamped_score = max(min_raw_score_per_trait, min(score, max_raw_score_per_trait))
        normalized = ((clamped_score - min_raw_score_per_trait) / raw_score_range) * 100
        normalized_scores[trait] = round(normalized)
        
    return normalized_scores

def get_dominant_profile(normalized_scores: Dict[str, int]) -> str:
    """Détermine le trait DISC dominant (ou une combinaison)."""
    if not normalized_scores:
        return "Indéterminé"
    # Simple: le trait avec le score le plus élevé
    # Une logique plus complexe pourrait identifier des profils combinés.
    dominant_trait = max(normalized_scores, key=normalized_scores.get)
    return dominant_trait

def assess_disc_profile(db: Session, user_id: int, answers: List[Dict[str, int]]) -> Optional[profile_model.Profile]:
    """
    Évalue le profil DISC d'un utilisateur basé sur ses réponses au questionnaire.
    Stocke les scores normalisés et le type DISC dominant.
    """
    profile = db.query(profile_model.Profile).filter(profile_model.Profile.user_id == user_id).first()
    if not profile:
        # Idéalement, un profil devrait exister. Gérer ce cas selon la logique de l'application.
        return None 

    raw_scores = calculate_disc_scores(answers)
    normalized_scores = normalize_scores(raw_scores)
    dominant_type = get_dominant_profile(normalized_scores)

    profile.disc_type = dominant_type
    # Stocker les scores normalisés. Assurez-vous que profile_model.Profile.disc_assessment_results
    # peut stocker un JSON ou un type de données structuré similaire.
    profile.disc_assessment_results = {
        "raw_scores": raw_scores,
        "normalized_scores": normalized_scores,
        "answers": answers # Stocker les réponses pour référence/audit
    }
    
    db.commit()
    db.refresh(profile)
    return profile

def get_disc_questionnaire() -> List[Dict[str, Any]]:
    """Retourne la structure du questionnaire DISC."""
    # Retourner seulement l'ID et les textes des affirmations pour le frontend
    return [
        {
            "id": q["id"],
            "affirmations": [item[0] for item in q["affirmations"]]
        }
        for q in DISC_QUESTIONS
    ]

def get_disc_profile_results(db: Session, user_id: int) -> Optional[Dict[str, Any]]:
    """Récupère les résultats de l'évaluation DISC d'un utilisateur."""
    profile = db.query(profile_model.Profile).filter(profile_model.Profile.user_id == user_id).first()
    if profile and profile.disc_assessment_results and isinstance(profile.disc_assessment_results, dict):
        return {
            "disc_type": profile.disc_type,
            "scores": profile.disc_assessment_results.get("normalized_scores"),
            # On pourrait ajouter plus de détails ici si nécessaire
        }
    return None

