// Extrait modifié du fichier api.ts - Service d'authentification

// Service d'authentification avec gestion d'erreur améliorée
export const authService = {
  loginUser: async (userData: { email: string; password: string }): Promise<string> => {
    try {
      setIsLoading(true);
      
      // Tentative de connexion au backend réel
      const params = new URLSearchParams();
      params.append("username", userData.email);
      params.append("password", userData.password);
      
      const response = await apiClient.post("/auth/token", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      
      storeTokens(response.data.access_token, response.data.refresh_token);
      return response.data.access_token;
    } catch (error: any) {
      logError("Erreur de connexion:", error);
      
      // Vérifier si l'erreur est due à des identifiants incorrects
      if (error.response?.status === 401) {
        throw new Error("Identifiants incorrects. Veuillez réessayer.");
      }
      
      throw new Error("Impossible de se connecter au serveur. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  },

  refreshToken: async (): Promise<string> => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error("Aucun token de rafraîchissement");
      
      // Tentative de rafraîchissement avec le backend réel
      const response = await apiClient.post("/auth/refresh", { refresh_token: refreshToken });
      storeTokens(response.data.access_token, response.data.refresh_token);
      return response.data.access_token;
    } catch (error: any) {
      logError("Erreur rafraîchissement token:", error);
      throw new Error("Session expirée, veuillez vous reconnecter");
    }
  },

  getCurrentUser: async (): Promise<IUser> => {
    try {
      const response = await apiClient.get("/users/me");
      return response.data;
    } catch (error: any) {
      logError("Erreur récupération profil:", error);
      throw new Error("Impossible de récupérer votre profil. Veuillez vous reconnecter.");
    }
  },

  register: async (userData: { email: string; password: string; full_name: string }): Promise<boolean> => {
    try {
      await apiClient.post("/users/register", userData);
      return true;
    } catch (error: any) {
      logError("Erreur inscription:", error);
      
      if (error.response?.status === 400) {
        throw new Error("Cet email est déjà utilisé ou les données fournies sont invalides.");
      }
      
      throw new Error("Impossible de créer votre compte. Veuillez réessayer plus tard.");
    }
  },

  logout: () => {
    clearTokens();
  }
};

