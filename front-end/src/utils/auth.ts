/**
 * Utilitaires pour la gestion de l'authentification
 */

/**
 * Vérifie si un token JWT est valide (non expiré)
 * @param token Le token JWT à vérifier
 * @returns true si le token est valide, false sinon
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  
  try {
    // Décodage simple du JWT (sans vérification de signature)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Vérifier si le token est expiré
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    return false;
  }
}

/**
 * Vérifie si l'application est en mode démo
 * @returns true si l'application est en mode démo, false sinon
 */
export function isInDemoMode(): boolean {
  const token = localStorage.getItem("spotbulle_token");
  return token?.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9") || false;
}

/**
 * Stocke les tokens d'authentification dans le localStorage
 * @param accessToken Le token d'accès
 * @param refreshToken Le token de rafraîchissement
 */
export function storeTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem("spotbulle_token", accessToken);
  localStorage.setItem("spotbulle_refresh_token", refreshToken);
}

/**
 * Récupère le token d'accès depuis le localStorage
 * @returns Le token d'accès ou null s'il n'existe pas
 */
export function getAccessToken(): string | null {
  return localStorage.getItem("spotbulle_token");
}

/**
 * Récupère le token de rafraîchissement depuis le localStorage
 * @returns Le token de rafraîchissement ou null s'il n'existe pas
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem("spotbulle_refresh_token");
}

/**
 * Supprime les tokens d'authentification du localStorage
 */
export function clearTokens(): void {
  localStorage.removeItem("spotbulle_token");
  localStorage.removeItem("spotbulle_refresh_token");
}

