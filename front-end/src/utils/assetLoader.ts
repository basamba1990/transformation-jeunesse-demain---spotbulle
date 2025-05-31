/**
 * Utilitaire de préchargement et gestion des ressources audio
 * 
 * Ce module fournit des fonctions pour précharger, vérifier et gérer
 * les ressources audio dans l'application SpotBulle.
 */

// Cache pour stocker les ressources audio préchargées
const audioCache: Record<string, HTMLAudioElement> = {};

/**
 * Précharge une ressource audio et la stocke dans le cache
 * @param src - Chemin de la ressource audio
 * @returns Promise qui se résout lorsque l'audio est chargé ou rejeté en cas d'erreur
 */
export const preloadAudio = (src: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    // Vérifier si l'audio est déjà dans le cache
    if (audioCache[src]) {
      resolve(audioCache[src]);
      return;
    }

    // Créer un nouvel élément audio
    const audio = new Audio();
    
    // Configurer les gestionnaires d'événements
    audio.addEventListener('canplaythrough', () => {
      // Stocker dans le cache et résoudre la promesse
      audioCache[src] = audio;
      resolve(audio);
    }, { once: true });
    
    audio.addEventListener('error', (e) => {
      console.error(`Erreur lors du chargement de l'audio: ${src}`, e);
      reject(new Error(`Impossible de charger la ressource audio: ${src}`));
    }, { once: true });
    
    // Définir la source et commencer le chargement
    audio.src = src;
    audio.load();
  });
};

/**
 * Vérifie si une ressource audio existe
 * @param src - Chemin de la ressource audio
 * @returns Promise qui se résout à true si la ressource existe, false sinon
 */
export const checkAudioExists = async (src: string): Promise<boolean> => {
  try {
    const response = await fetch(src, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Erreur lors de la vérification de l'audio: ${src}`, error);
    return false;
  }
};

/**
 * Précharge plusieurs ressources audio en parallèle
 * @param sources - Tableau de chemins de ressources audio
 * @returns Promise qui se résout lorsque toutes les ressources sont chargées
 */
export const preloadMultipleAudio = async (sources: string[]): Promise<Record<string, HTMLAudioElement>> => {
  const results: Record<string, HTMLAudioElement> = {};
  
  // Créer un tableau de promesses pour le chargement parallèle
  const promises = sources.map(async (src) => {
    try {
      const audio = await preloadAudio(src);
      results[src] = audio;
    } catch (error) {
      console.warn(`Échec du préchargement pour: ${src}`, error);
      // Ne pas bloquer le chargement des autres ressources
    }
  });
  
  // Attendre que toutes les promesses soient résolues
  await Promise.all(promises);
  
  return results;
};

/**
 * Joue une ressource audio préchargée
 * @param src - Chemin de la ressource audio
 * @returns Promise qui se résout lorsque l'audio commence à jouer
 */
export const playAudio = async (src: string): Promise<void> => {
  try {
    // Précharger si pas déjà dans le cache
    if (!audioCache[src]) {
      await preloadAudio(src);
    }
    
    // Réinitialiser et jouer
    const audio = audioCache[src];
    audio.currentTime = 0;
    return audio.play();
  } catch (error) {
    console.error(`Erreur lors de la lecture audio: ${src}`, error);
    throw error;
  }
};

/**
 * Libère les ressources d'une entrée du cache
 * @param src - Chemin de la ressource audio à libérer
 */
export const releaseAudio = (src: string): void => {
  if (audioCache[src]) {
    audioCache[src].src = '';
    delete audioCache[src];
  }
};

/**
 * Vide complètement le cache audio
 */
export const clearAudioCache = (): void => {
  Object.keys(audioCache).forEach(key => {
    audioCache[key].src = '';
    delete audioCache[key];
  });
};

export default {
  preloadAudio,
  checkAudioExists,
  preloadMultipleAudio,
  playAudio,
  releaseAudio,
  clearAudioCache
};
