# Fichier de configuration pour l'application FastAPI

import os
from dotenv import load_dotenv
from urllib.parse import urlparse

# Chargement des variables depuis le fichier .env
load_dotenv()

# Chargement des variables d'environnement avec des valeurs par défaut
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./spotbulle.db")
SECRET_KEY = os.getenv("SECRET_KEY", "votre_cle_secrete_par_defaut_a_changer")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME", "default-bucket")
PROJECT_EMAIL = os.getenv("PROJECT_EMAIL", "admin@exemple.com")
PROJECT_ID = os.getenv("PROJECT_ID", "default_project_id")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")

# Fonction utilitaire pour valider l'URL (Supabase par exemple)
def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme in ['http', 'https'], result.netloc])
    except Exception as e:
        print(f"Erreur lors de la validation de l'URL : {e}")
        return False

# Vérification de l'URL Supabase
if not is_valid_url(SUPABASE_URL):
    raise ValueError(f"SUPABASE_URL invalide : {SUPABASE_URL}")

# Fonction pour masquer les valeurs sensibles dans l'affichage debug
def masked(value):
    return '*' * len(value) if value else None

# Affichage pour le débogage (sans exposer les clés sensibles)
print(f"DATABASE_URL: {DATABASE_URL}")
print(f"SECRET_KEY: {masked(SECRET_KEY)}")
print(f"SUPABASE_URL: {SUPABASE_URL}")
print(f"SUPABASE_KEY: {masked(SUPABASE_KEY)}")
print(f"OPENAI_API_KEY: {masked(OPENAI_API_KEY)}")
print(f"BUCKET_NAME: {BUCKET_NAME}")
print(f"PROJECT_EMAIL: {PROJECT_EMAIL}")
print(f"PROJECT_ID: {PROJECT_ID}")
