/**
 * Utilitaire de préchargement des ressources audio
 * 
 * Ce module permet de précharger les ressources audio pour éviter les erreurs
 * de chargement et améliorer l'expérience utilisateur.
 */

// Tableau des chemins audio à précharger
const audioResources = [
  '/assets/audio/samples_jfk.mp3',
  '/assets/audio/EconomicModel.wav'
];

// Cache pour stocker les ressources préchargées
const audioCache = new Map<string, HTMLAudioElement>();

/**
 * Précharge une ressource audio spécifique
 * @param src Chemin de la ressource audio
 * @returns Promise qui se résout lorsque l'audio est chargé ou rejeté en cas d'erreur
 */
export const preloadAudio = (src: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    // Vérifier si l'audio est déjà dans le cache
    if (audioCache.has(src)) {
      resolve(audioCache.get(src)!);
      return;
    }

    // Créer un nouvel élément audio
    const audio = new Audio();
    
    // Configurer les gestionnaires d'événements
    audio.addEventListener('canplaythrough', () => {
      audioCache.set(src, audio);
      resolve(audio);
    }, { once: true });
    
    audio.addEventListener('error', (e) => {
      console.error(`Erreur lors du préchargement de l'audio ${src}:`, e);
      reject(new Error(`Impossible de charger la ressource audio: ${src}`));
    }, { once: true });
    
    // Commencer le chargement
    audio.src = src;
    audio.load();
  });
};

/**
 * Précharge toutes les ressources audio définies
 * @returns Promise qui se résout lorsque toutes les ressources sont chargées
 */
export const preloadAllAudio = async (): Promise<void> => {
  try {
    const promises = audioResources.map(src => 
      preloadAudio(src).catch(err => {
        console.warn(`Échec du préchargement de ${src}:`, err);
        return null; // Continuer malgré l'erreur
      })
    );
    
    await Promise.all(promises);
    console.log('Préchargement audio terminé');
  } catch (error) {
    console.error('Erreur lors du préchargement audio:', error);
  }
};

/**
 * Vérifie si une ressource audio est disponible dans le cache
 * @param src Chemin de la ressource audio
 * @returns true si la ressource est disponible, false sinon
 */
export const isAudioCached = (src: string): boolean => {
  return audioCache.has(src);
};

/**
 * Récupère une ressource audio du cache
 * @param src Chemin de la ressource audio
 * @returns L'élément audio ou null s'il n'est pas dans le cache
 */
export const getAudioFromCache = (src: string): HTMLAudioElement | null => {
  return audioCache.get(src) || null;
};

export default {
  preloadAudio,
  preloadAllAudio,
  isAudioCached,
  getAudioFromCache
};
