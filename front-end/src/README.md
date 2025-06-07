# Instructions pour désactiver le mode démonstration de SpotBulle

Ce document explique comment appliquer les modifications nécessaires pour désactiver le mode démonstration de la plateforme SpotBulle et la rendre pleinement fonctionnelle.

## Fichiers modifiés

1. `src/utils/auth.ts` - Désactivation de la fonction de détection du mode démo
2. `src/App.tsx` - Modification des routes pour utiliser les versions authentifiées
3. `src/services/api.ts` - Suppression de la logique spéciale pour les utilisateurs de démonstration
4. `.env` - Configuration des variables d'environnement pour le backend réel

## Instructions d'application

### 1. Désactiver la fonction de détection du mode démo

Remplacez la fonction `isInDemoMode()` dans le fichier `src/utils/auth.ts` par la version suivante :

```typescript
/**
 * Vérifie si l'application est en mode démo
 * @returns false - Le mode démo est désactivé
 */
export function isInDemoMode(): boolean {
  // Mode démo désactivé - retourne toujours false
  return false;
}
```

### 2. Modifier les routes dans App.tsx

Remplacez le contenu du fichier `src/App.tsx` par la version fournie dans `spotbulle_fixes/App.tsx`. Les principales modifications sont :

- Suppression des imports des pages de démonstration
- Remplacement des routes de démonstration par les versions authentifiées
- Suppression des routes dupliquées avec "/authenticated"

### 3. Modifier le service d'authentification

Dans le fichier `src/services/api.ts`, remplacez les fonctions du service d'authentification par celles fournies dans `spotbulle_fixes/authService.ts`. Les principales modifications sont :

- Suppression de la logique spéciale pour les utilisateurs de démonstration
- Suppression des conditions qui vérifient `isInDemoMode()` et retournent des données fictives

### 4. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet frontend avec le contenu suivant :

```
VITE_API_BASE_URL=https://api.spotbulle.com
VITE_API_TIMEOUT=30000
VITE_MAX_FILE_SIZE=209715200
VITE_DEBUG_MODE=false
```

Remplacez `https://api.spotbulle.com` par l'URL réelle de votre backend.

## Vérification

Après avoir appliqué ces modifications, vous devriez :

1. Ne plus voir le message "Vous êtes en mode démonstration" sur la page de profil
2. Pouvoir vous connecter avec vos identifiants réels
3. Accéder aux fonctionnalités protégées comme la création de pods, la transcription, etc.
4. Voir vos données réelles au lieu des données de démonstration

## Remarques importantes

- Ces modifications supposent que vous avez un backend fonctionnel accessible à l'URL spécifiée dans le fichier `.env`
- Si vous n'avez pas encore de backend, vous devrez en déployer un avant d'appliquer ces modifications
- Assurez-vous de sauvegarder vos fichiers originaux avant d'appliquer les modifications

