"""
Script pour créer directement les tables dans la base de données PostgreSQL
Ce script utilise SQLAlchemy pour créer toutes les tables définies dans les modèles
sans dépendre d'Alembic.
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError

# Ajouter le répertoire parent au chemin pour pouvoir importer les modules de l'application
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importer les modèles et la base de données
try:
    print("Importation des modèles et de la base de données...")
    from app.database import Base
    
    # Importer tous les modèles pour qu'ils soient enregistrés dans Base.metadata
    # Assurez-vous que tous vos modèles sont importés ici
    from app.models import user_model
    # Importez d'autres modèles si nécessaire, par exemple:
    try:
        from app.models import pod_model
        print("Modèle pod_model importé avec succès")
    except ImportError:
        print("Note: pod_model n'a pas pu être importé, ignoré")
    
    try:
        from app.models import profile_model
        print("Modèle profile_model importé avec succès")
    except ImportError:
        print("Note: profile_model n'a pas pu être importé, ignoré")
    
    # Vous pouvez ajouter d'autres modèles selon votre structure
    print("Tous les modèles ont été importés avec succès")
except ImportError as e:
    print(f"Erreur lors de l'importation des modèles: {e}")
    sys.exit(1)

def create_all_tables():
    """Crée toutes les tables définies dans les modèles SQLAlchemy"""
    
    # Récupérer l'URL de la base de données depuis les variables d'environnement
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        print("ERREUR: La variable d'environnement DATABASE_URL n'est pas définie")
        sys.exit(1)
    
    # Masquer les informations sensibles dans les logs
    masked_url = database_url.split('@')[0] + '@' + database_url.split('@')[1] if '@' in database_url else database_url
    print(f"URL de la base de données: {masked_url}")
    
    try:
        # Créer le moteur SQLAlchemy
        print("Création du moteur SQLAlchemy...")
        engine = create_engine(database_url)
        
        # Créer toutes les tables
        print("Création des tables dans la base de données...")
        Base.metadata.create_all(bind=engine)
        
        # Afficher les tables créées
        print("Tables créées avec succès:")
        for table in Base.metadata.sorted_tables:
            print(f"- {table.name}")
        
        print("\nToutes les tables ont été créées avec succès!")
        return True
    except SQLAlchemyError as e:
        print(f"ERREUR lors de la création des tables: {e}")
        return False

if __name__ == "__main__":
    print("Démarrage du script de création des tables...")
    success = create_all_tables()
    if success:
        print("Script terminé avec succès")
        sys.exit(0)
    else:
        print("Script terminé avec des erreurs")
        sys.exit(1)
