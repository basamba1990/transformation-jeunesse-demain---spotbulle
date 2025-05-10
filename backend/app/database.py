# Fichier pour la configuration et la session de la base de données SQLAlchemy

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import settings  # Importe l'instance de configuration

DATABASE_URL = settings.DATABASE_URL  # Accès à l'URL de la base de données

# Crée un moteur SQLAlchemy
# Pour SQLite, connect_args est nécessaire pour permettre le multithreading
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

# Crée une SessionLocal class. Chaque instance de SessionLocal sera une session de base de données.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crée une classe Base. Les classes de modèles hériteront de cette classe.
Base = declarative_base()

# Importer les modèles ici pour s'assurer qu'ils sont enregistrés avec Base.metadata
# avant qu'Alembic ne tente de générer des migrations.
from .models import user_model, pod_model, profile_model

# Fonction pour obtenir une session de base de données (dépendance pour les routes)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Fonction pour créer toutes les tables dans la base de données
def create_tables():
    Base.metadata.create_all(bind=engine)
