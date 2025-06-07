/**
 * Utilitaires pour le débogage
 */

/**
 * Indique si le mode débogage est activé
 * Basé sur la variable d'environnement VITE_DEBUG_MODE
 */
export const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

/**
 * Affiche un message de débogage dans la console si le mode débogage est activé
 * @param message Le message à afficher
 * @param data Les données à afficher (optionnel)
 */
export function logDebug(message: string, data?: any): void {
  if (DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`, data);
  }
}

/**
 * Affiche un message d'erreur de débogage dans la console si le mode débogage est activé
 * @param message Le message d'erreur à afficher
 * @param error L'erreur à afficher (optionnel)
 */
export function logError(message: string, error?: any): void {
  if (DEBUG_MODE) {
    console.error(`[ERROR] ${message}`, error);
  } else {
    // En production, on affiche un message d'erreur plus simple
    console.error(message);
  }
}

/**
 * Indique si les informations de débogage doivent être affichées dans l'interface
 * @returns true si les informations de débogage doivent être affichées, false sinon
 */
export function showDebugInfo(): boolean {
  return DEBUG_MODE;
}

/**
 * Affiche les informations de débogage d'une requête API
 * @param method La méthode HTTP
 * @param url L'URL de la requête
 * @param data Les données envoyées (optionnel)
 */
export function logApiRequest(method: string, url: string, data?: any): void {
  if (DEBUG_MODE) {
    console.log(`[API] ${method} ${url}`, data);
  }
}

/**
 * Affiche les informations de débogage d'une réponse API
 * @param method La méthode HTTP
 * @param url L'URL de la requête
 * @param status Le code de statut HTTP
 * @param data Les données reçues (optionnel)
 */
export function logApiResponse(method: string, url: string, status: number, data?: any): void {
  if (DEBUG_MODE) {
    console.log(`[API] ${method} ${url} - ${status}`, data);
  }
}

