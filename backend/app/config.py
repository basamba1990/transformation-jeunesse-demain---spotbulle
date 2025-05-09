# Fichier de configuration pour l'application FastAPI

import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()  # Charge les variables depuis le fichier .env

# Chargement des variables d'environnement avec valeurs par défaut
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./spotbulle.db")
SECRET_KEY = os.getenv("SECRET_KEY", "votre_cle_secrete_par_defaut_a_changer")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")
PROJECT_EMAIL = os.getenv("PROJECT_EMAIL")
PROJECT_ID = os.getenv("PROJECT_ID")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")

# Validation de l'URL Supabase
def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme in ['http', 'https'], result.netloc])
    except:
        return False

if not is_valid_url(SUPABASE_URL):
    raise ValueError(f"SUPABASE_URL invalide : {SUPABASE_URL}")

# Affichage masqué pour debug sans exposer les secrets
def masked(value):
    return '*' * len(value) if value else None

print(f"DATABASE_URL: {DATABASE_URL}")
print(f"SECRET_KEY: {masked(SECRET_KEY)}")
print(f"SUPABASE_URL: {SUPABASE_URL}")
print(f"SUPABASE_KEY: {masked(SUPABASE_KEY)}")
print(f"OPENAI_API_KEY: {masked(OPENAI_API_KEY)}")
