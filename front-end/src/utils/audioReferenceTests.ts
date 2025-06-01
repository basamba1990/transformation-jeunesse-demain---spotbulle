/**
 * Tests automatisés pour vérifier les références audio
 * 
 * Ce module permet de vérifier que toutes les références audio
 * dans le code source pointent vers des fichiers existants.
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';

// Dossier racine du projet
const ROOT_DIR = process.cwd();
// Dossier contenant les fichiers audio
const AUDIO_DIR = path.join(ROOT_DIR, 'public/assets/audio');
// Extensions de fichiers à analyser
const FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

/**
 * Vérifie si un fichier audio existe
 * @param audioPath Chemin relatif du fichier audio (ex: /assets/audio/sample.mp3)
 * @returns true si le fichier existe, false sinon
 */
export const audioFileExists = (audioPath: string): boolean => {
  // Convertir le chemin relatif en chemin absolu
  const normalizedPath = audioPath.startsWith('/') 
    ? audioPath.substring(1) 
    : audioPath;
  
  const fullPath = path.join(ROOT_DIR, 'public', normalizedPath);
  
  return fs.existsSync(fullPath);
};

/**
 * Extrait les références audio d'un fichier source
 * @param filePath Chemin du fichier source
 * @returns Tableau des références audio trouvées
 */
export const extractAudioReferences = (filePath: string): string[] => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Recherche des références à des fichiers audio
    // Pattern: /assets/audio/quelquechose.mp3 ou .wav
    const audioPattern = /['"]\/assets\/audio\/[^'"]+\.(mp3|wav|ogg|aac)['"]|audioSrc=["']\/assets\/audio\/[^'"]+\.(mp3|wav|ogg|aac)["']/g;
    const matches = content.match(audioPattern) || [];
    
    // Nettoyer les résultats pour extraire uniquement le chemin
    return matches.map(match => {
      // Extraire le chemin entre guillemets
      const pathMatch = match.match(/['"]([^'"]+)['"]/);
      return pathMatch ? pathMatch[1] : '';
    }).filter(Boolean);
  } catch (error) {
    console.error(`Erreur lors de l'analyse du fichier ${filePath}:`, error);
    return [];
  }
};

/**
 * Trouve tous les fichiers source dans le projet
 * @returns Tableau des chemins de fichiers
 */
export const findSourceFiles = (): string[] => {
  const sourceFiles: string[] = [];
  
  FILE_EXTENSIONS.forEach(ext => {
    const files = glob.sync(`${ROOT_DIR}/src/**/*${ext}`);
    sourceFiles.push(...files);
  });
  
  return sourceFiles;
};

/**
 * Trouve tous les fichiers audio dans le projet
 * @returns Tableau des chemins de fichiers audio
 */
export const findAudioFiles = (): string[] => {
  if (!fs.existsSync(AUDIO_DIR)) {
    return [];
  }
  
  return glob.sync(`${AUDIO_DIR}/**/*.{mp3,wav,ogg,aac}`);
};

/**
 * Vérifie toutes les références audio dans le projet
 * @returns Objet contenant les résultats de l'analyse
 */
export const checkAllAudioReferences = () => {
  const sourceFiles = findSourceFiles();
  const audioFiles = findAudioFiles();
  
  // Convertir les chemins audio en chemins relatifs pour la comparaison
  const availableAudioPaths = audioFiles.map(file => {
    const relativePath = path.relative(path.join(ROOT_DIR, 'public'), file);
    return '/' + relativePath.replace(/\\/g, '/');
  });
  
  const results = {
    referencedFiles: new Set<string>(),
    missingFiles: new Set<string>(),
    unusedFiles: new Set<string>(),
    fileReferences: {} as Record<string, string[]>
  };
  
  // Analyser chaque fichier source
  sourceFiles.forEach(file => {
    const references = extractAudioReferences(file);
    
    if (references.length > 0) {
      const relativeFile = path.relative(ROOT_DIR, file);
      results.fileReferences[relativeFile] = references;
      
      references.forEach(ref => {
        results.referencedFiles.add(ref);
        
        if (!audioFileExists(ref)) {
          results.missingFiles.add(ref);
        }
      });
    }
  });
  
  // Identifier les fichiers audio non utilisés
  availableAudioPaths.forEach(audioPath => {
    if (!results.referencedFiles.has(audioPath)) {
      results.unusedFiles.add(audioPath);
    }
  });
  
  return {
    totalSourceFiles: sourceFiles.length,
    totalAudioFiles: audioFiles.length,
    referencedFiles: Array.from(results.referencedFiles),
    missingFiles: Array.from(results.missingFiles),
    unusedFiles: Array.from(results.unusedFiles),
    fileReferences: results.fileReferences
  };
};

// Exécuter les tests si ce fichier est appelé directement
if (require.main === module) {
  const results = checkAllAudioReferences();
  
  console.log('=== Rapport de vérification des références audio ===');
  console.log(`Fichiers source analysés: ${results.totalSourceFiles}`);
  console.log(`Fichiers audio disponibles: ${results.totalAudioFiles}`);
  console.log(`Références audio trouvées: ${results.referencedFiles.length}`);
  console.log(`Fichiers audio manquants: ${results.missingFiles.length}`);
  console.log(`Fichiers audio non utilisés: ${results.unusedFiles.length}`);
  
  if (results.missingFiles.length > 0) {
    console.log('\nFichiers audio manquants:');
    results.missingFiles.forEach(file => console.log(`- ${file}`));
  }
  
  if (results.unusedFiles.length > 0) {
    console.log('\nFichiers audio non utilisés:');
    results.unusedFiles.forEach(file => console.log(`- ${file}`));
  }
  
  console.log('\nDétail des références par fichier:');
  Object.entries(results.fileReferences).forEach(([file, refs]) => {
    console.log(`\n${file}:`);
    refs.forEach(ref => {
      const status = results.missingFiles.includes(ref) ? '❌' : '✅';
      console.log(`  ${status} ${ref}`);
    });
  });
}

export default {
  audioFileExists,
  extractAudioReferences,
  findSourceFiles,
  findAudioFiles,
  checkAllAudioReferences
};
