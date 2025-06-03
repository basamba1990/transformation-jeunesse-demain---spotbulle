// Ce script permet de synchroniser les ressources statiques du frontend vers le backend
// Il doit être exécuté après chaque build du frontend ou avant chaque déploiement

const fs = require('fs');
const path = require('path');

// Chemins source et destination
const FRONTEND_ASSETS_DIR = path.resolve(__dirname, '../front-end/src/assets');
const BACKEND_STATIC_DIR = path.resolve(__dirname, '../backend/static/media');

// Créer le répertoire de destination s'il n'existe pas
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    console.log(`Création du répertoire: ${directory}`);
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Copier un fichier de la source vers la destination
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`Copié: ${path.basename(source)} -> ${destination}`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la copie de ${source}: ${error.message}`);
    return false;
  }
}

// Fonction principale pour synchroniser les assets
function syncAssets() {
  console.log('Début de la synchronisation des ressources statiques...');
  
  // S'assurer que le répertoire de destination existe
  ensureDirectoryExists(BACKEND_STATIC_DIR);
  
  // Lire tous les fichiers du répertoire source
  const files = fs.readdirSync(FRONTEND_ASSETS_DIR);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Copier chaque fichier
  for (const file of files) {
    const sourcePath = path.join(FRONTEND_ASSETS_DIR, file);
    const destPath = path.join(BACKEND_STATIC_DIR, file);
    
    // Vérifier si c'est un fichier (pas un répertoire)
    if (fs.statSync(sourcePath).isFile()) {
      const success = copyFile(sourcePath, destPath);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
  }
  
  console.log(`Synchronisation terminée: ${successCount} fichiers copiés, ${errorCount} erreurs`);
}

// Exécuter la synchronisation
syncAssets();
