# Guide de test des modifications

Ce document explique comment tester manuellement les modifications pour s'assurer que le mode démonstration est bien désactivé et que la plateforme SpotBulle est pleinement fonctionnelle.

## Prérequis

- Un backend fonctionnel accessible à l'URL spécifiée dans le fichier `.env`
- Les modifications ont été appliquées selon les instructions du fichier README.md

## Tests à effectuer

### 1. Vérification de l'absence du message de démonstration

1. Lancez l'application avec `npm run dev`
2. Connectez-vous avec vos identifiants réels
3. Accédez à la page de profil
4. **Résultat attendu** : Le message "Vous êtes en mode démonstration. Les modifications ne seront pas sauvegardées." ne doit pas apparaître

### 2. Test de connexion

1. Accédez à la page de connexion
2. Entrez vos identifiants réels
3. Cliquez sur le bouton "Se connecter"
4. **Résultat attendu** : Vous devez être connecté et redirigé vers la page d'accueil

### 3. Test d'accès aux fonctionnalités protégées

#### 3.1 Accès à la page de profil

1. Cliquez sur le lien "Profil" dans la navigation
2. **Résultat attendu** : Vous devez voir votre profil réel avec vos informations

#### 3.2 Accès à la page des pods

1. Cliquez sur le lien "Pods" dans la navigation
2. **Résultat attendu** : Vous devez voir la page des pods réelle, pas la version de démonstration

#### 3.3 Accès au service de transcription

1. Accédez à la page du service de transcription
2. **Résultat attendu** : Vous devez voir la page du service de transcription réelle, pas la version de démonstration

#### 3.4 Accès au service vidéo

1. Accédez à la page du service vidéo
2. **Résultat attendu** : Vous devez voir la page du service vidéo réelle, pas la version de démonstration

### 4. Test de création et de modification

#### 4.1 Création d'un pod

1. Accédez à la page des pods
2. Créez un nouveau pod
3. **Résultat attendu** : Le pod doit être créé et sauvegardé dans la base de données

#### 4.2 Modification du profil

1. Accédez à la page de profil
2. Cliquez sur "Modifier le profil"
3. Modifiez quelques informations
4. Enregistrez les modifications
5. Rafraîchissez la page
6. **Résultat attendu** : Les modifications doivent être sauvegardées et visibles après le rafraîchissement

### 5. Test de déconnexion et de reconnexion

1. Cliquez sur "Déconnexion"
2. Reconnectez-vous avec vos identifiants
3. **Résultat attendu** : Vous devez pouvoir vous reconnecter et retrouver vos données

## Résolution des problèmes

Si vous rencontrez des problèmes lors des tests, vérifiez les points suivants :

1. **Erreurs de connexion** : Vérifiez que l'URL du backend dans le fichier `.env` est correcte
2. **Erreurs 401 (Non autorisé)** : Vérifiez que vos identifiants sont corrects
3. **Erreurs 404 (Non trouvé)** : Vérifiez que les routes du backend correspondent à celles attendues par le frontend
4. **Données de démonstration toujours visibles** : Vérifiez que la fonction `isInDemoMode()` retourne bien `false` et que les conditions qui vérifient cette fonction dans les services API ont été supprimées

## Conclusion

Si tous les tests sont réussis, cela signifie que le mode démonstration a été correctement désactivé et que la plateforme SpotBulle est pleinement fonctionnelle avec un backend réel.

