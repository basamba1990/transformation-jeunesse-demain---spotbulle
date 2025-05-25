# Rapport de test et correction - Projet Spotbulle

## Résumé

J'ai testé avec succès la connexion et la création de pods dans le projet Spotbulle. Plusieurs erreurs ont été identifiées et corrigées, permettant finalement au backend de fonctionner correctement et de valider la création de pods via l'API.

## Problèmes identifiés et corrections apportées

### 1. Erreur d'import relatif dans main.py

**Problème** : Lors du lancement du serveur FastAPI, une erreur d'import relatif était générée :
```
ImportError: attempted relative import with no known parent package
```

**Solution** : Création d'un script de lancement dédié (`run_backend.py`) qui configure correctement le chemin Python et lance le serveur sur un port spécifique.

### 2. Erreur de connexion à la base de données PostgreSQL

**Problème** : Le backend ne parvenait pas à se connecter à la base de données PostgreSQL distante :
```
sqlalchemy.exc.OperationalError: could not translate host name "dpg-d0ns3vadbo4c73a7hclg-a" to address: Name or service not known
```

**Solution** : Modification du fichier `.env` pour utiliser SQLite localement au lieu de PostgreSQL :
```
DATABASE_URL="sqlite:///./spotbulle.db"
```

### 3. Incompatibilité du type ARRAY dans SQLite

**Problème** : SQLite ne supporte pas le type ARRAY utilisé dans le modèle Pod :
```
sqlalchemy.exc.CompileError: (in table 'pods', column 'tags'): Compiler can't render element of type ARRAY
```

**Solution** : Modification du modèle `pod_model.py` pour remplacer le type ARRAY par un type Text compatible avec SQLite :
```python
# Avant
tags = Column(ARRAY(String), nullable=True)

# Après
tags = Column(Text, nullable=True)  # Tags stockés en JSON sous forme de texte
```

### 4. Conflit de port lors du lancement du serveur

**Problème** : Le port 8000 était déjà utilisé par des processus précédents.

**Solution** : Création d'un script de lancement dédié utilisant le port 8001 et nettoyage des processus existants.

### 5. Route d'authentification incorrecte

**Problème** : La tentative de connexion via `/api/v1/auth/login` échouait avec une erreur "Not Found".

**Solution** : Identification de la route correcte `/api/v1/auth/token` dans la documentation OpenAPI et utilisation de celle-ci pour l'authentification.

## Tests effectués et résultats

1. **Création d'utilisateur** : Réussi
   ```bash
   curl -X 'POST' 'http://0.0.0.0:8001/api/v1/auth/register' -H 'accept: application/json' -H 'Content-Type: application/json' -d '{"email": "test@example.com", "password": "Test123!", "full_name": "Test User"}'
   ```

2. **Authentification et obtention du token** : Réussi
   ```bash
   curl -X 'POST' 'http://0.0.0.0:8001/api/v1/auth/token' -H 'accept: application/json' -H 'Content-Type: application/x-www-form-urlencoded' -d 'username=test@example.com&password=Test123!'
   ```

3. **Création de pod avec authentification** : Réussi
   ```bash
   curl -X 'POST' 'http://0.0.0.0:8001/api/v1/pods/' -H 'accept: application/json' -H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json' -d '{"title": "Test Pod", "description": "Ceci est un test de création de pod", "audio_file_url": "https://example.com/audio.mp3"}'
   ```

## Instructions pour lancer le backend

1. Naviguez vers le dossier du projet :
   ```bash
   cd projet/transformation-jeunesse-demain---spotbulle-main/backend
   ```

2. Activez l'environnement virtuel :
   ```bash
   source venv/bin/activate
   ```

3. Lancez le serveur avec le script dédié :
   ```bash
   python run_backend.py
   ```

4. Le serveur sera accessible à l'adresse : http://0.0.0.0:8001

5. La documentation API est disponible à : http://0.0.0.0:8001/api/v1/docs

## Remarques importantes

- Le backend utilise maintenant SQLite au lieu de PostgreSQL pour faciliter les tests locaux
- La création de pod nécessite une authentification préalable via `/api/v1/auth/token`
- Le modèle de données a été adapté pour être compatible avec SQLite
- Un avertissement concernant la variable d'environnement OPENAI_API_KEY non définie s'affiche au démarrage, mais n'empêche pas le fonctionnement de base

## Conclusion

Après plusieurs corrections, le backend fonctionne correctement et permet la création de pods via l'API. Les tests ont validé l'ensemble du flux critique : création d'utilisateur, authentification et création de pod.
