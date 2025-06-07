# SpotBulle - Corrections et améliorations

Ce dépôt contient les corrections et améliorations apportées au site SpotBulle pour résoudre les problèmes identifiés avec le profil, les pods, les matches, les transcriptions et les vidéos.

## Problèmes résolus

1. **Page de profil** : Correction des problèmes d'affichage et amélioration de la gestion des erreurs
2. **Pods** : Unification des routes et amélioration de la gestion des erreurs
3. **Matches** : Implémentation d'un vrai service qui appelle l'API
4. **Transcriptions** : Amélioration de l'interface et de la gestion des erreurs
5. **Vidéos** : Amélioration de l'interface et de la gestion des erreurs
6. **Authentification** : Amélioration de la gestion des tokens et du mode démo
7. **Expérience utilisateur** : Ajout d'un indicateur de mode démo et amélioration des messages d'erreur

## Structure des fichiers

```
spotbulle_fixed/
├── .env                      # Variables d'environnement
├── src/
│   ├── components/           # Composants réutilisables
│   │   ├── Alert.tsx         # Composant pour les messages d'erreur
│   │   └── MainLayout.tsx    # Layout principal avec indicateur de mode démo
│   ├── contexts/
│   │   └── AuthContext.tsx   # Contexte d'authentification amélioré
│   ├── pages/                # Pages de l'application
│   │   ├── ProfilePage.tsx   # Page de profil corrigée
│   │   ├── PodsPage.tsx      # Page des pods corrigée
│   │   ├── MatchesPage.tsx   # Page des matches corrigée
│   │   ├── TranscriptionServicePage.tsx  # Service de transcription corrigé
│   │   └── VideoServicePage.tsx          # Service vidéo corrigé
│   ├── services/
│   │   └── api.ts            # Services API améliorés
│   ├── utils/
│   │   ├── auth.ts           # Utilitaires pour l'authentification
│   │   └── debug.ts          # Utilitaires pour le débogage
│   └── App.tsx               # Configuration des routes unifiées
└── README.md                 # Ce fichier
```

## Instructions d'installation

### Prérequis

- Node.js 16.x ou supérieur
- npm 8.x ou supérieur

### Installation

1. Clonez le dépôt original de SpotBulle :

```bash
git clone https://github.com/votre-organisation/spotbulle.git
cd spotbulle
```

2. Remplacez les fichiers par ceux de ce dépôt :

```bash
# Créez un répertoire de sauvegarde pour les fichiers originaux
mkdir -p backup/src/{components,contexts,pages,services,utils}

# Sauvegardez les fichiers originaux
cp .env backup/ 2>/dev/null || true
cp src/App.tsx backup/src/ 2>/dev/null || true
cp src/components/Alert.tsx backup/src/components/ 2>/dev/null || true
cp src/components/MainLayout.tsx backup/src/components/ 2>/dev/null || true
cp src/contexts/AuthContext.tsx backup/src/contexts/ 2>/dev/null || true
cp src/pages/ProfilePage.tsx backup/src/pages/ 2>/dev/null || true
cp src/pages/PodsPage.tsx backup/src/pages/ 2>/dev/null || true
cp src/pages/MatchesPage.tsx backup/src/pages/ 2>/dev/null || true
cp src/pages/TranscriptionServicePage.tsx backup/src/pages/ 2>/dev/null || true
cp src/pages/VideoServicePage.tsx backup/src/pages/ 2>/dev/null || true
cp src/services/api.ts backup/src/services/ 2>/dev/null || true

# Copiez les nouveaux fichiers
cp -r /chemin/vers/spotbulle_fixed/* .
```

3. Installez les dépendances :

```bash
npm install
```

4. Configurez les variables d'environnement :

Vérifiez le fichier `.env` et ajustez les variables selon votre environnement :

```
VITE_API_BASE_URL=https://votre-backend.com/api/v1
VITE_DEBUG_MODE=false
```

5. Lancez l'application en mode développement :

```bash
npm run dev
```

## Mode démo vs Mode authentifié

L'application dispose désormais d'un indicateur clair pour distinguer le mode démo du mode authentifié :

- En mode démo, une bannière jaune s'affiche en haut de l'écran
- Les données affichées en mode démo sont clairement identifiées comme fictives
- L'authentification est gérée de manière plus robuste

## Gestion des erreurs

La gestion des erreurs a été améliorée :

- Affichage de messages d'erreur clairs et contextuels
- Possibilité de réessayer les actions qui ont échoué
- Logs détaillés en mode débogage

## Mode débogage

Un mode débogage a été ajouté pour faciliter le développement :

1. Activez-le en définissant `VITE_DEBUG_MODE=true` dans le fichier `.env`
2. Une bannière violette s'affiche en haut de l'écran
3. Des logs détaillés sont affichés dans la console du navigateur

## Contribution

Pour contribuer à ce projet :

1. Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`)
2. Committez vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
3. Poussez vers la branche (`git push origin feature/ma-fonctionnalite`)
4. Ouvrez une Pull Request

## Licence

Ce projet est sous licence [MIT](LICENSE).

