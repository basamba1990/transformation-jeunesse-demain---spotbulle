#!/bin/bash

# Script de vérification des modifications pour désactiver le mode démonstration

echo "=== Vérification des modifications pour désactiver le mode démonstration ==="
echo

# Vérifier si les fichiers modifiés existent
echo "1. Vérification des fichiers modifiés..."
FILES_TO_CHECK=(
  "src/utils/auth.ts"
  "src/App.tsx"
  "src/services/api.ts"
  ".env"
)

for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file existe"
  else
    echo "❌ $file n'existe pas"
  fi
done
echo

# Vérifier si la fonction isInDemoMode retourne false
echo "2. Vérification de la fonction isInDemoMode()..."
if grep -q "return false" src/utils/auth.ts; then
  echo "✅ La fonction isInDemoMode() retourne false"
else
  echo "❌ La fonction isInDemoMode() ne retourne pas false"
fi
echo

# Vérifier si les routes de démonstration ont été supprimées
echo "3. Vérification des routes dans App.tsx..."
if grep -q "PodsPageDemo" src/App.tsx; then
  echo "❌ Les routes de démonstration sont toujours présentes dans App.tsx"
else
  echo "✅ Les routes de démonstration ont été supprimées de App.tsx"
fi
echo

# Vérifier si les routes authentifiées sont correctement configurées
echo "4. Vérification des routes authentifiées..."
if grep -q "<ProtectedRoute>" src/App.tsx && grep -q "<PodsPage />" src/App.tsx; then
  echo "✅ Les routes authentifiées sont correctement configurées"
else
  echo "❌ Les routes authentifiées ne sont pas correctement configurées"
fi
echo

# Vérifier si les variables d'environnement sont configurées
echo "5. Vérification des variables d'environnement..."
if grep -q "VITE_API_BASE_URL" .env; then
  echo "✅ Les variables d'environnement sont configurées"
else
  echo "❌ Les variables d'environnement ne sont pas configurées"
fi
echo

echo "=== Vérification terminée ==="
echo
echo "Pour tester complètement les modifications, vous devez :"
echo "1. Démarrer l'application avec 'npm run dev'"
echo "2. Vérifier que le message 'Vous êtes en mode démonstration' n'apparaît plus"
echo "3. Tester la connexion avec des identifiants réels"
echo "4. Vérifier que toutes les fonctionnalités protégées sont accessibles"
echo
echo "Note : Ces tests supposent que vous avez un backend fonctionnel configuré dans le fichier .env"

