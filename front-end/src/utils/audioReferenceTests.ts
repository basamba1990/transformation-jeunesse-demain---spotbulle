/**
 * Tests automatisés pour détecter les références à des fichiers audio inexistants
 * 
 * Ce module analyse le code source pour identifier les références à des fichiers audio
 * et vérifie leur existence dans le dossier public.
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { checkAudioExists } from './assetLoader';

// Configuration
const SRC_DIR = path.resolve(process.cwd(), 'src');
const PUBLIC_AUDIO_DIR = path.resolve(process.cwd(), 'public/assets/audio');
const REPORT_FILE = path.resolve(process.cwd(), 'audio-references-report.md');

// Expressions régulières pour trouver les références audio
const AUDIO_REF_PATTERNS = [
  /audioSrc=["']([^"']+\.mp3)["']/g,
  /src=["']([^"']+\.mp3)["']/g,
  /source src=["']([^"']+\.mp3)["']/g,
  /new Audio\(["']([^"']+\.mp3)["']\)/g,
  /audio\.src = ["']([^"']+\.mp3)["']/g
];

/**
 * Trouve toutes les références audio dans les fichiers source
 */
async function findAudioReferences() {
  const references = new Map<string, string[]>();
  
  // Trouver tous les fichiers .tsx, .ts, .jsx, .js
  const files = glob.sync(`${SRC_DIR}/**/*.{tsx,ts,jsx,js}`);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativeFilePath = path.relative(process.cwd(), file);
    
    // Chercher toutes les références audio dans le fichier
    for (const pattern of AUDIO_REF_PATTERNS) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const audioPath = match[1];
        
        if (!references.has(audioPath)) {
          references.set(audioPath, []);
        }
        
        references.get(audioPath)?.push(relativeFilePath);
      }
    }
  }
  
  return references;
}

/**
 * Trouve tous les fichiers audio dans le dossier public
 */
function findExistingAudioFiles() {
  if (!fs.existsSync(PUBLIC_AUDIO_DIR)) {
    return [];
  }
  
  const audioFiles = glob.sync(`${PUBLIC_AUDIO_DIR}/**/*.mp3`);
  return audioFiles.map(file => {
    // Convertir en chemin relatif comme utilisé dans les références
    const relativePath = '/assets/audio/' + path.relative(PUBLIC_AUDIO_DIR, file);
    return relativePath.replace(/\\/g, '/'); // Normaliser les chemins pour Windows
  });
}

/**
 * Génère un rapport sur les références audio
 */
async function generateAudioReferenceReport() {
  console.log('Analyse des références audio...');
  
  const references = await findAudioReferences();
  const existingFiles = findExistingAudioFiles();
  
  // Identifier les références manquantes et inutilisées
  const missingReferences: Map<string, string[]> = new Map();
  const unusedFiles: string[] = [...existingFiles];
  
  // Vérifier les références manquantes
  for (const [audioPath, files] of references.entries()) {
    const fullPath = path.join(process.cwd(), 'public', audioPath);
    const exists = existingFiles.includes(audioPath);
    
    if (!exists) {
      missingReferences.set(audioPath, files);
    } else {
      // Marquer comme utilisé
      const index = unusedFiles.indexOf(audioPath);
      if (index !== -1) {
        unusedFiles.splice(index, 1);
      }
    }
  }
  
  // Générer le rapport
  let report = `# Rapport de vérification des références audio\n\n`;
  report += `Date: ${new Date().toLocaleString()}\n\n`;
  
  // Résumé
  report += `## Résumé\n\n`;
  report += `- Total des références audio: ${references.size}\n`;
  report += `- Fichiers audio existants: ${existingFiles.length}\n`;
  report += `- Références manquantes: ${missingReferences.size}\n`;
  report += `- Fichiers audio non utilisés: ${unusedFiles.length}\n\n`;
  
  // Détails des références manquantes
  if (missingReferences.size > 0) {
    report += `## Références manquantes\n\n`;
    for (const [audioPath, files] of missingReferences.entries()) {
      report += `### ${audioPath}\n\n`;
      report += `Référencé dans les fichiers suivants:\n`;
      for (const file of files) {
        report += `- \`${file}\`\n`;
      }
      report += `\n`;
    }
  }
  
  // Détails des fichiers non utilisés
  if (unusedFiles.length > 0) {
    report += `## Fichiers audio non utilisés\n\n`;
    for (const file of unusedFiles) {
      report += `- \`${file}\`\n`;
    }
  }
  
  // Écrire le rapport
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`Rapport généré: ${REPORT_FILE}`);
  
  return {
    totalReferences: references.size,
    existingFiles: existingFiles.length,
    missingReferences: missingReferences.size,
    unusedFiles: unusedFiles.length
  };
}

// Exécuter le test si appelé directement
if (require.main === module) {
  generateAudioReferenceReport()
    .then(results => {
      console.log('Analyse terminée:');
      console.log(results);
      
      // Sortir avec un code d'erreur si des références sont manquantes
      if (results.missingReferences > 0) {
        console.error(`ERREUR: ${results.missingReferences} références audio manquantes détectées.`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Erreur lors de l\'analyse:', error);
      process.exit(1);
    });
}

export { findAudioReferences, findExistingAudioFiles, generateAudioReferenceReport };
