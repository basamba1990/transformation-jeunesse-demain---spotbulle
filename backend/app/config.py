# Fichier de configuration pour l'application FastAPI

import os
from dotenv import load_dotenv
from urllib.parse import urlparse
from pydantic import BaseSettings, validator

# Chargement des variables depuis le fichier .env
load_dotenv()

# Classe de configuration
class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./spotbulle.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "votre_cle_secrete_par_defaut_a_changer")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    BUCKET_NAME: str = os.getenv("BUCKET_NAME", "default-bucket")
    PROJECT_EMAIL: str = os.getenv("PROJECT_EMAIL", "admin@exemple.com")
    PROJECT_ID: str = os.getenv("PROJECT_ID", "default_project_id")
    DATABASE_PASSWORD: str = os.getenv("DATABASE_PASSWORD")

    @validator("SUPABASE_URL")
    def validate_url(cls, v):
        try:
            result = urlparse(v)
            if not all([result.scheme in ['http', 'https'], result.netloc]):
                raise ValueError("URL invalide")
            return v
        except Exception as e:
            raise ValueError(f"Erreur de validation SUPABASE_URL : {e}")

# Création d'une instance globale
settings = Settings()

# Fonction pour masquer les valeurs sensibles dans l'affichage debug
def masked(value):
    return '*' * len(value) if value else None

# Affichage pour le débogage (sans exposer les clés sensibles)
print(f"DATABASE_URL: {settings.DATABASE_URL}")
print(f"SECRET_KEY: {masked(settings.SECRET_KEY)}")
print(f"SUPABASE_URL: {settings.SUPABASE_URL}")
print(f"SUPABASE_KEY: {masked(settings.SUPABASE_KEY)}")
print(f"OPENAI_API_KEY: {masked(settings.OPENAI_API_KEY)}")
print(f"BUCKET_NAME: {settings.BUCKET_NAME}")
print(f"PROJECT_EMAIL: {settings.PROJECT_EMAIL}")
print(f"PROJECT_ID: {settings.PROJECT_ID}")
