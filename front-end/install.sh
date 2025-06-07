#!/bin/bash

# Script d'installation des corrections pour SpotBulle
# Ce script remplace les fichiers existants par les versions corrigées

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERREUR]${NC} $1"
}

# Vérifier si le répertoire front-end existe
if [ ! -d "front-end" ]; then
  print_error "Le répertoire 'front-end' n'existe pas. Veuillez exécuter ce script depuis la racine du projet SpotBulle."
  exit 1
fi

# Créer un répertoire de sauvegarde
print_message "Création d'un répertoire de sauvegarde..."
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR/front-end/src/"{components,contexts,pages,services,utils}

# Sauvegarder les fichiers originaux
print_message "Sauvegarde des fichiers originaux..."
cp front-end/.env "$BACKUP_DIR/front-end/" 2>/dev/null || true
cp front-end/src/App.tsx "$BACKUP_DIR/front-end/src/" 2>/dev/null || true
cp front-end/src/components/Alert.tsx "$BACKUP_DIR/front-end/src/components/" 2>/dev/null || true
cp front-end/src/components/MainLayout.tsx "$BACKUP_DIR/front-end/src/components/" 2>/dev/null || true
cp front-end/src/contexts/AuthContext.tsx "$BACKUP_DIR/front-end/src/contexts/" 2>/dev/null || true
cp front-end/src/pages/ProfilePage.tsx "$BACKUP_DIR/front-end/src/pages/" 2>/dev/null || true
cp front-end/src/pages/PodsPage.tsx "$BACKUP_DIR/front-end/src/pages/" 2>/dev/null || true
cp front-end/src/pages/MatchesPage.tsx "$BACKUP_DIR/front-end/src/pages/" 2>/dev/null || true
cp front-end/src/pages/TranscriptionServicePage.tsx "$BACKUP_DIR/front-end/src/pages/" 2>/dev/null || true
cp front-end/src/pages/VideoServicePage.tsx "$BACKUP_DIR/front-end/src/pages/" 2>/dev/null || true
cp front-end/src/services/api.ts "$BACKUP_DIR/front-end/src/services/" 2>/dev/null || true

# Créer les répertoires nécessaires s'ils n'existent pas
print_message "Création des répertoires nécessaires..."
mkdir -p front-end/src/{components,contexts,pages,services,utils}

# Copier les fichiers corrigés
print_message "Copie des fichiers corrigés..."

# Fichier .env
if [ -f ".env" ]; then
  cp .env front-end/
  print_message "Fichier .env copié"
else
  print_warning "Fichier .env non trouvé, création d'un fichier par défaut"
  cat > front-end/.env << EOL
# Variables d'environnement pour SpotBulle

# URL de base de l'API
VITE_API_BASE_URL=https://spotbulle-backend-0lax.onrender.com/api/v1

# Mode de débogage (true/false)
VITE_DEBUG_MODE=false

# Timeout pour les requêtes API (en millisecondes)
VITE_API_TIMEOUT=30000

# Taille maximale des fichiers (en octets) - 200 Mo
VITE_MAX_FILE_SIZE=209715200
EOL
fi

# Copier les fichiers de composants
cp src/components/Alert.tsx front-end/src/components/ 2>/dev/null || print_warning "Fichier Alert.tsx non trouvé"
cp src/components/MainLayout.tsx front-end/src/components/ 2>/dev/null || print_warning "Fichier MainLayout.tsx non trouvé"

# Copier les fichiers de contextes
cp src/contexts/AuthContext.tsx front-end/src/contexts/ 2>/dev/null || print_warning "Fichier AuthContext.tsx non trouvé"

# Copier les fichiers de pages
cp src/pages/ProfilePage.tsx front-end/src/pages/ 2>/dev/null || print_warning "Fichier ProfilePage.tsx non trouvé"
cp src/pages/PodsPage.tsx front-end/src/pages/ 2>/dev/null || print_warning "Fichier PodsPage.tsx non trouvé"
cp src/pages/MatchesPage.tsx front-end/src/pages/ 2>/dev/null || print_warning "Fichier MatchesPage.tsx non trouvé"
cp src/pages/TranscriptionServicePage.tsx front-end/src/pages/ 2>/dev/null || print_warning "Fichier TranscriptionServicePage.tsx non trouvé"
cp src/pages/VideoServicePage.tsx front-end/src/pages/ 2>/dev/null || print_warning "Fichier VideoServicePage.tsx non trouvé"

# Copier les fichiers de services
cp src/services/api.ts front-end/src/services/ 2>/dev/null || print_warning "Fichier api.ts non trouvé"

# Copier les fichiers d'utilitaires
cp src/utils/auth.ts front-end/src/utils/ 2>/dev/null || print_warning "Fichier auth.ts non trouvé"
cp src/utils/debug.ts front-end/src/utils/ 2>/dev/null || print_warning "Fichier debug.ts non trouvé"

# Copier le fichier App.tsx
cp src/App.tsx front-end/src/ 2>/dev/null || print_warning "Fichier App.tsx non trouvé"

# Copier le fichier README.md
cp README.md . 2>/dev/null || print_warning "Fichier README.md non trouvé"

print_message "Installation terminée avec succès !"
print_message "Les fichiers originaux ont été sauvegardés dans le répertoire $BACKUP_DIR"
print_message "Pour lancer l'application, exécutez les commandes suivantes :"
print_message "  cd front-end"
print_message "  npm install"
print_message "  npm run dev"

