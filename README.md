# SpotBulle - Plateforme de Transformation Personnelle

## 🎯 Description

SpotBulle est une plateforme innovante de transformation personnelle et de connexion par l'audio. Elle permet aux utilisateurs de partager leurs pensées, explorer leur personnalité et se connecter avec d'autres personnes partageant leurs valeurs et intérêts.

## ✨ Fonctionnalités

### 🎙️ Capsules Audio
- Enregistrement et partage de pensées sous forme de capsules audio
- Interface intuitive pour la création de contenu audio
- Gestion et organisation des capsules personnelles

### 👥 Profil DISC
- Découverte du profil de personnalité DISC
- Matching avec des personnes compatibles
- Recommandations personnalisées

### 🤖 Assistant IA
- Conseils personnalisés pour le développement personnel
- Analyse des interactions et suggestions d'amélioration
- Support intelligent pour la croissance personnelle

### 🎥 Services Avancés
- **Transcription IA** : Conversion audio vers texte en temps réel
- **Vidéo WebRTC** : Appels vidéo multi-participants HD
- **Streaming Live** : Diffusion sur YouTube, Facebook, Twitch
- **Chat Collaboratif** : Communication temps réel avec partage de fichiers

## 🛠️ Technologies

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le design
- **Vite** pour le build et développement
- **Lucide React** pour les icônes
- **Axios** pour les appels API

### Backend
- **FastAPI** (Python)
- **SQLAlchemy** pour l'ORM
- **PostgreSQL** / SQLite
- **JWT** pour l'authentification
- **Supabase** pour le stockage
- **OpenAI** pour l'IA

## 🚀 Installation

### Prérequis
- Node.js 18+
- Python 3.11+
- PostgreSQL (production) ou SQLite (développement)

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configurer les variables dans .env
python create_tables.py
python run_backend.py
```

### Frontend
```bash
cd front-end
npm install
npm run dev
```

## 📝 Configuration

### Variables d'environnement (.env)
```env
DATABASE_URL=postgresql://username:password@host:port/database_name
SECRET_KEY=your-super-secret-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
OPENAI_API_KEY=your-openai-key
```

## 🌐 Déploiement

### Frontend (Vercel/Netlify)
```bash
npm run build
# Déployer le dossier dist/
```

### Backend (Render/Railway)
```bash
# Configurer les variables d'environnement
# Déployer avec requirements.txt
```

## 📋 Scripts Disponibles

### Frontend
- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Aperçu du build

### Backend
- `python run_backend.py` - Serveur de développement
- `python create_tables.py` - Création des tables
- `python fix_dependencies.py` - Correction des dépendances

## 🔧 Corrections Récentes

### Backend
- ✅ Correction erreur `'User' object has no attribute 'bio'`
- ✅ Fix version bcrypt (4.0.1)
- ✅ Gestion robuste des attributs utilisateur

### Frontend
- ✅ Suppression du mode démonstration
- ✅ Interface 100% professionnelle
- ✅ Configuration API flexible
- ✅ Gestion d'erreurs améliorée

## 🎨 Design

- **Design moderne** avec Tailwind CSS
- **Mode sombre** disponible
- **Responsive** mobile-first
- **Animations fluides**
- **Interface intuitive**

## 🔒 Sécurité

- Authentification JWT
- Hashage bcrypt des mots de passe
- Validation des données avec Pydantic
- Protection CORS configurée

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la documentation
2. Consultez les logs d'erreur
3. Vérifiez la configuration des variables d'environnement

## 📄 Licence

Projet privé - Tous droits réservés

---

**SpotBulle** - Spreading Your Voice, Pitch Your Path 🎯

