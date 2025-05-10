# config.py — Configuration pour l'application FastAPI

import os
from dotenv import load_dotenv
from urllib.parse import urlparse

# Chargement des variables d'environnement
load_dotenv()

def is_valid_url(url):
    """Valide une URL."""
    try:
        result = urlparse(url)
        return all([result.scheme in ['http', 'https'], result.netloc])
    except Exception as e:
        print(f"[Erreur] Validation URL : {e}")
        return False

def masked(value):
    """Masque les valeurs sensibles pour l'affichage."""
    return '*' * len(value) if value else None

class Settings:
    def __init__(self):
        self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./spotbulle.db")
        self.SECRET_KEY = os.getenv("SECRET_KEY", "change_this_secret_key")
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

        self.SUPABASE_URL = os.getenv("SUPABASE_URL")
        self.SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.BUCKET_NAME = os.getenv("BUCKET_NAME", "default-bucket")
        self.PROJECT_EMAIL = os.getenv("PROJECT_EMAIL", "admin@example.com")
        self.PROJECT_ID = os.getenv("PROJECT_ID", "default_project_id")
        self.DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")

        if not is_valid_url(self.SUPABASE_URL):
            raise ValueError(f"SUPABASE_URL invalide : {self.SUPABASE_URL}")

        # Debug masqué
        print(f"DATABASE_URL: {self.DATABASE_URL}")
        print(f"SECRET_KEY: {masked(self.SECRET_KEY)}")
        print(f"SUPABASE_KEY: {masked(self.SUPABASE_KEY)}")
        print(f"OPENAI_API_KEY: {masked(self.OPENAI_API_KEY)}")

settings = Settings()
