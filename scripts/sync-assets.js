#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script de synchronisation des assets pour SpotBulle
 * Ce script s'assure que tous les assets sont correctement copiés dans le dossier de build
 */

const sourceDir = path.join(__dirname, '../front-end/src/assets');
const publicDir = path.join(__dirname, '../front-end/public');
const distDir = path.join(__dirname, '../front-end/dist');
const distAssetsDir = path.join(distDir, 'assets');

console.log('🚀 Démarrage de la synchronisation des assets...');

// Fonction pour copier récursivement un dossier
function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    
    if (fs.lstatSync(fromPath).isFile()) {
      fs.copyFileSync(fromPath, toPath);
      console.log(`✅ Copié: ${element}`);
    } else {
      copyFolderSync(fromPath, toPath);
    }
  });
}

// Fonction pour vérifier et créer les dossiers nécessaires
function ensureDirectories() {
  const dirs = [distDir, distAssetsDir];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Dossier créé: ${dir}`);
    }
  });
}

// Fonction principale
function syncAssets() {
  try {
    ensureDirectories();
    
    // Copier les assets depuis src/assets vers dist/assets
    if (fs.existsSync(sourceDir)) {
      console.log('📋 Copie des assets depuis src/assets...');
      copyFolderSync(sourceDir, distAssetsDir);
    } else {
      console.warn('⚠️  Le dossier src/assets n\'existe pas');
    }
    
    // Copier les fichiers publics vers dist
    if (fs.existsSync(publicDir)) {
      console.log('📋 Copie des fichiers publics...');
      fs.readdirSync(publicDir).forEach(file => {
        const sourcePath = path.join(publicDir, file);
        const destPath = path.join(distDir, file);
        
        if (fs.lstatSync(sourcePath).isFile() && file !== 'index.html') {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`✅ Copié: ${file}`);
        }
      });
    }
    
    // Créer un manifest des assets pour le cache
    const manifest = {
      timestamp: new Date().toISOString(),
      assets: []
    };
    
    if (fs.existsSync(distAssetsDir)) {
      function addToManifest(dir, basePath = '') {
        fs.readdirSync(dir).forEach(file => {
          const filePath = path.join(dir, file);
          const relativePath = path.join(basePath, file);
          
          if (fs.lstatSync(filePath).isFile()) {
            manifest.assets.push({
              path: relativePath.replace(/\\/g, '/'),
              size: fs.statSync(filePath).size,
              type: path.extname(file)
            });
          } else {
            addToManifest(filePath, relativePath);
          }
        });
      }
      
      addToManifest(distAssetsDir);
    }
    
    // Sauvegarder le manifest
    fs.writeFileSync(
      path.join(distDir, 'assets-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log('✨ Synchronisation des assets terminée avec succès!');
    console.log(`📊 ${manifest.assets.length} fichiers traités`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des assets:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  syncAssets();
}

module.exports = { syncAssets };

