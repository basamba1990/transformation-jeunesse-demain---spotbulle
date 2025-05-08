# Fichier de configuration pour l'application FastAPI

import os
from dotenv import load_dotenv

load_dotenv() # Charge les variables depuis le fichier .env

# Exemple de variables de configuration (à adapter selon vos besoins)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./spotbulle.db")
SECRET_KEY = os.getenv("SECRET_KEY", "votre_cle_secrete_par_defaut_a_changer")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Clés API (NE PAS LES STOCKER EN DUR ICI EN PRODUCTION)
# Utiliser les variables d'environnement chargées depuis .env
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Paramètres du bucket de stockage
BUCKET_NAME = os.getenv("BUCKET_NAME")

# Informations projet (si nécessaire pour la configuration)
PROJECT_EMAIL = os.getenv("PROJECT_EMAIL")
PROJECT_ID = os.getenv("PROJECT_ID")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")

# Vous pouvez ajouter d'autres configurations ici
# Par exemple, pour la connexion à une base de données Supabase:
# if SUPABASE_URL and SUPABASE_KEY:
#     from supabase import create_client, Client
#     supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print(f"DATABASE_URL: {DATABASE_URL}")
print(f"SECRET_KEY: {'*' * len(SECRET_KEY) if SECRET_KEY else None}")
print(f"SUPABASE_URL: {SUPABASE_URL}")
print(f"SUPABASE_KEY: {'*' * len(SUPABASE_KEY) if SUPABASE_KEY else None}")
print(f"OPENAI_API_KEY: {'*' * len(OPENAI_API_KEY) if OPENAI_API_KEY else None}")

