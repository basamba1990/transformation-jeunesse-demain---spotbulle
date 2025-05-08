# Projet Spotbulle MVP

Ce projet est une application web "Minimum Viable Product" (MVP) pour Spotbulle, une plateforme conçue pour connecter les utilisateurs à travers des capsules audio (pods), des profils DISC, et une assistance par IA.

## Structure du Projet

Le projet est divisé en deux parties principales :

-   `backend/`: Une API construite avec FastAPI (Python) gérant la logique métier, la base de données, et les interactions avec les services externes (comme OpenAI).
-   `frontend/`: Une interface utilisateur construite avec React (TypeScript) et Vite, stylisée avec Tailwind CSS, permettant aux utilisateurs d'interagir avec la plateforme.

### Backend (`spotbulle-mvp/backend/`)

-   **`app/`**: Contient le cœur de l'application FastAPI.
    -   **`main.py`**: Point d'entrée de l'application API, initialise FastAPI et inclut les routeurs.
    -   **`models/`**: Définit les modèles de données SQLAlchemy (ORM) pour les utilisateurs (`user_model.py`), les pods (`pod_model.py`), et les profils (`profile_model.py`).
    -   **`routes/`**: Contient les endpoints de l'API. Actuellement, `auth_routes.py` pour l'authentification et `pod_routes.py` pour la gestion des pods. D'autres routes pour les profils et l'IA peuvent être ajoutées.
    -   **`services/`**: Héberge la logique métier. `user_service.py` et `pod_service.py` pour les opérations CRUD de base. `disc_service.py` et `ia_service.py` contiennent des ébauches pour les fonctionnalités DISC et d'interaction avec l'IA (OpenAI).
    -   **`schemas/`**: Définit les schémas Pydantic pour la validation des données d'entrée/sortie de l'API (`user_schema.py`, `pod_schema.py`, `profile_schema.py`, `token_schema.py`).
    -   **`utils/`**: Fonctions auxiliaires, comme `security.py` pour le hachage de mot de passe et la gestion des tokens JWT.
    -   **`config.py`**: Gère les variables d'environnement et les configurations de l'application (chargées depuis `.env`).
    -   **`database.py`**: Configure la connexion à la base de données SQLAlchemy et fournit des sessions de base de données.
-   **`requirements.txt`**: Liste les dépendances Python pour le backend.
-   **`.env`**: Fichier pour stocker les variables d'environnement (clés API, URL de base de données). **Ne pas versionner ce fichier avec des clés réelles en production.** Un exemple est fourni.

### Frontend (`spotbulle-mvp/frontend/`)

-   **`public/`**: Contient les actifs statiques publics.
-   **`src/`**: Code source de l'application React.
    -   **`App.tsx`**: Composant racine qui configure le routage avec `react-router-dom`.
    -   **`index.tsx`**: Point d'entrée de l'application React, rend le composant `App`.
    -   **`index.css`**: Fichier CSS global où les directives Tailwind CSS sont importées.
    -   **`components/`**: Composants React réutilisables (ex: `Navbar.tsx`, `Footer.tsx`).
    -   **`pages/`**: Composants React représentant les différentes pages de l'application (ex: `HomePage.tsx`, `ProfilePage.tsx`, `PodsPage.tsx`).
    -   **`layout/`**: Composants pour la structure de la page (ex: `MainLayout.tsx`).
    -   **`profile/`**: Composants spécifiques à la gestion du profil utilisateur et à l'onboarding DISC (ex: `DISCOnboardingComponent.tsx`).
    -   **`ia/`**: Composants pour l'interaction avec le bot IA (ex: `IABotComponent.tsx`).
    -   **`pods/`**: Composants liés à la gestion et à l'affichage des pods audio, y compris l'enregistrement (ex: `AudioRecorderComponent.tsx`).
    -   **`services/`**: (À créer) Pourrait contenir la logique d'appel API vers le backend.
    -   **`hooks/`**: (À créer) Pour les hooks React personnalisés.
    -   **`contexts/`**: (À créer) Pour la gestion d'état global avec React Context si nécessaire.
-   **`tailwind.config.js`**: Fichier de configuration pour Tailwind CSS.
-   **`postcss.config.js`**: Fichier de configuration pour PostCSS (utilisé par Tailwind CSS).
-   **`vite.config.ts`**: Fichier de configuration pour Vite.
-   **`package.json`**: Liste les dépendances JavaScript et les scripts pour le frontend.

## Fonctionnalités Implémentées (Ébauches)

-   **Authentification des utilisateurs** (enregistrement, connexion via JWT).
-   **Gestion des Pods Audio** (CRUD de base, ébauche pour l'upload et la transcription).
-   **Profils Utilisateurs** (structure de base, préparation pour le profil DISC).
-   **Interaction avec un Bot IA** (ébauche d'interface et de service pour OpenAI).
-   **Enregistrement Audio et Transcription** (ébauche d'interface pour l'enregistrement via le navigateur et préparation pour la transcription).
-   **Onboarding DISC** (ébauche d'interface pour un questionnaire DISC simplifié).

## Pour Commencer

### Prérequis

-   Python 3.8+ et pip
-   Node.js et npm (ou yarn)

### Backend

1.  Naviguez vers le dossier `backend/`.
2.  Créez un environnement virtuel : `python -m venv venv`
3.  Activez l'environnement virtuel : 
    -   Sur Windows : `venv\Scripts\activate`
    -   Sur macOS/Linux : `source venv/bin/activate`
4.  Installez les dépendances : `pip install -r requirements.txt`
5.  Copiez `.env.example` vers `.env` (si un exemple est fourni) et configurez vos variables d'environnement (clés API, URL de base de données).
    -   Par défaut, une base de données SQLite (`spotbulle.db`) sera créée dans le dossier `backend/app/`.
6.  Lancez le serveur de développement FastAPI : `uvicorn app.main:app --reload --port 8000 --app-dir app` (depuis le dossier `backend/`)

### Frontend

1.  Naviguez vers le dossier `frontend/`.
2.  Installez les dépendances : `npm install` (ou `yarn install`)
3.  Lancez le serveur de développement Vite : `npm run dev` (ou `yarn dev`)
4.  Ouvrez votre navigateur et allez sur `http://localhost:5173` (ou le port indiqué par Vite).

## Prochaines Étapes et Améliorations Possibles

-   **Compléter l'intégration API** entre le frontend et le backend pour toutes les fonctionnalités.
-   **Implémenter la logique d'upload de fichiers audio** vers un service de stockage (ex: Supabase Storage, AWS S3) et lier les URLs aux pods.
-   **Développer la logique de transcription audio réelle** (ex: via l'API OpenAI Whisper ou un autre service).
-   **Affiner la logique d'évaluation DISC** et l'affichage des résultats.
-   **Développer la logique de matching IA** de manière plus robuste.
-   **Ajouter des tests unitaires et d'intégration**.
-   **Améliorer l'UI/UX** et le design général.
-   **Sécuriser davantage l'application** (validation d'entrée plus stricte, protection CSRF, XSS, etc.).
-   **Mettre en place un système de migration de base de données** (ex: Alembic pour SQLAlchemy).
-   **Déployer l'application** sur une plateforme d'hébergement.

## Contribution

Ce projet est une ébauche. Les contributions sont les bienvenues pour l'améliorer et le compléter.




## Déploiement sur Render

Le déploiement de cette application (backend FastAPI et frontend React) ainsi que d'une base de données PostgreSQL peut être effectué sur Render en utilisant le fichier `render.yaml` fourni à la racine du projet.

### Prérequis pour le déploiement sur Render

1.  **Compte Render :** Vous devez avoir un compte sur [Render](https://render.com/).
2.  **Dépôt Git :** Votre projet doit être hébergé sur un dépôt Git (GitHub, GitLab, Bitbucket) accessible par Render.
3.  **Configuration des variables d'environnement sensibles :** Avant de déployer, assurez-vous d'avoir configuré les variables d'environnement nécessaires (comme `SUPABASE_URL`, `SUPABASE_KEY`, `OPENAI_API_KEY`, `BUCKET_NAME`) directement dans l'interface de Render pour vos services. Le fichier `render.yaml` est configuré pour ne pas synchroniser ces valeurs (`sync: false`) depuis le fichier, ce qui est une bonne pratique de sécurité. La `SECRET_KEY` pour FastAPI sera générée automatiquement par Render si `generateValue: true` est utilisé, sinon fournissez la vôtre. La `DATABASE_URL` sera automatiquement injectée par Render si vous utilisez leur service de base de données.

### Étapes de déploiement

1.  **Créer un "Blueprint" sur Render :**
    *   Dans votre tableau de bord Render, cliquez sur "New" > "Blueprint".
    *   Connectez votre dépôt Git où se trouve le projet Spotbulle.
    *   Render détectera automatiquement le fichier `render.yaml` et proposera de créer les services définis (backend, frontend, base de données).
2.  **Configurer les variables d'environnement :**
    *   Avant de lancer le premier déploiement, allez dans les paramètres de chaque service (surtout `spotbulle-backend`) sur Render et ajoutez les variables d'environnement manquantes (celles marquées avec `sync: false` ou celles que vous souhaitez surcharger).
3.  **Lancer le déploiement :**
    *   Une fois la configuration vérifiée, Render commencera le processus de build et de déploiement pour chaque service.
    *   Le backend (`spotbulle-backend`) installera les dépendances Python, appliquera les migrations Alembic (`alembic upgrade head`), puis lancera le serveur Uvicorn.
    *   Le frontend (`spotbulle-frontend`) installera les dépendances Node.js, construira l'application React avec Vite, et déploiera les fichiers statiques. La variable d'environnement `VITE_API_BASE_URL` sera automatiquement configurée pour pointer vers l'URL de votre service backend déployé.
    *   La base de données (`spotbulle-db`) sera provisionnée.
4.  **Accéder à l'application :**
    *   Une fois le déploiement terminé, Render fournira des URLs publiques pour votre frontend et votre backend.
    *   L'application frontend devrait être accessible et communiquer avec le backend.

### Notes importantes pour le déploiement

*   **Migrations de base de données :** La commande `alembic upgrade head` est incluse dans la `buildCommand` du service backend dans `render.yaml`. Cela garantit que votre schéma de base de données est à jour à chaque déploiement. Assurez-vous que votre `DATABASE_URL` dans Render pointe vers la base de données PostgreSQL provisionnée par Render.
*   **Base de données :** Le `render.yaml` est configuré pour utiliser une base de données PostgreSQL gérée par Render. Si vous utilisez SQLite localement, le passage à PostgreSQL en production est une pratique courante pour la robustesse. Assurez-vous que `psycopg2-binary` est bien dans votre `backend/requirements.txt`.
*   **Variables d'environnement Frontend :** La variable `VITE_API_BASE_URL` est cruciale pour que votre application frontend sache où envoyer les requêtes API. Render s'en charge grâce à la configuration `fromService` dans `render.yaml`.
*   **Région :** Les services sont configurés pour la région `frankfurt` par défaut. Choisissez la région la plus appropriée pour vous et vos utilisateurs.
*   **Plans :** Les services sont configurés avec le plan `free` de Render. Pour des applications en production avec plus de trafic ou des besoins en ressources plus importants, vous devrez passer à des plans payants.

