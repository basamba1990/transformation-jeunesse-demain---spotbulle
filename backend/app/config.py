# Fichier de configuration pour l'application FastAPI

import os
from dotenv import load_dotenv
from urllib.parse import urlparse

# Chargement des variables depuis le fichier .env
load_dotenv()

# Fonction utilitaire pour valider l'URL (Supabase par exemple)
def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme in ['http', 'https'], result.netloc])
    except Exception as e:
        print(f"Erreur lors de la validation de l'URL : {e}")
        return False

# Fonction pour masquer les valeurs sensibles dans l'affichage debug
def masked(value):
    return '*' * len(value) if value else None

# Classe de configuration
class Settings:
    def __init__(self):
        self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./spotbulle.db")
        self.SECRET_KEY = os.getenv("SECRET_KEY", "votre_cle_secrete_par_defaut_a_changer")
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

        self.SUPABASE_URL = os.getenv("SUPABASE_URL")
        self.SUPABASE_KEY = os.getenv("SUPABASE_KEY")
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.BUCKET_NAME = os.getenv("BUCKET_NAME", "default-bucket")
        self.PROJECT_EMAIL = os.getenv("PROJECT_EMAIL", "admin@exemple.com")
        self.PROJECT_ID = os.getenv("PROJECT_ID", "default_project_id")
        self.DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")

        # Vérifie l'URL Supabase au démarrage
        if not is_valid_url(self.SUPABASE_URL):
            raise ValueError(f"SUPABASE_URL invalide : {self.SUPABASE_URL}")

        # Debug : affiche les principales variables (masquées)
        print(f"DATABASE_URL: {self.DATABASE_URL}")
        print(f"SECRET_KEY: {masked(self.SECRET_KEY)}")
        print(f"SUPABASE_URL: {self.SUPABASE_URL}")
        print(f"SUPABASE_KEY: {masked(self.SUPABASE_KEY)}")
        print(f"OPENAI_API_KEY: {masked(self.OPENAI_API_KEY)}")
        print(f"BUCKET_NAME: {self.BUCKET_NAME}")
        print(f"PROJECT_EMAIL: {self.PROJECT_EMAIL}")
        print(f"PROJECT_ID: {self.PROJECT_ID}")

# Crée une instance unique (singleton) accessible globalement
settings = Settings()
