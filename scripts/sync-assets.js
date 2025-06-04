// Ce script permet de synchroniser les ressources statiques du frontend vers le backend
// Il doit être exécuté après chaque build du frontend ou avant chaque déploiement

const fs = require('fs');
const path = require('path');

// Chemins source et destination
const FRONTEND_ASSETS_DIR = path.resolve(__dirname, '../front-end/public/assets');
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
  
  // Fonction récursive pour copier les fichiers et dossiers
  function copyRecursive(sourceDir, destDir) {
    const items = fs.readdirSync(sourceDir);
    
    for (const item of items) {
      const sourcePath = path.join(sourceDir, item);
      const destPath = path.join(destDir, item);
      
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        // Créer le dossier de destination s'il n'existe pas
        ensureDirectoryExists(destPath);
        // Copier récursivement le contenu du dossier
        copyRecursive(sourcePath, destPath);
      } else {
        // Copier le fichier
        const success = copyFile(sourcePath, destPath);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }
    }
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  // Copier tous les assets récursivement
  copyRecursive(FRONTEND_ASSETS_DIR, BACKEND_STATIC_DIR);
  
  console.log(`Synchronisation terminée: ${successCount} fichiers copiés, ${errorCount} erreurs`);
}

// Exécuter la synchronisation
syncAssets();
