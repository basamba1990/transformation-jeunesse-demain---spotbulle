import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IUser, authService } from "../services/api"; // Import ajouté

interface AuthContextType {
  isAuthenticated: boolean;
  user: IUser | null;
  token: string | null;
  login: (token: string, userData: IUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilisateur fictif pour le mode développement local
const mockUser: IUser = {
  id: "local-dev-user-id",
  email: "dev@spotbulle.fr",
  full_name: "Utilisateur Local",
  username: "dev_user",
  profile_picture: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthContextType>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    login: (token, user) => {
      localStorage.setItem("spotbulle_token", token);
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: true, 
        user, 
        token,
        isLoading: false 
      }));
    },
    logout: () => {
      // En mode développement local, on se contente de supprimer le token du localStorage
      localStorage.removeItem("spotbulle_token");
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: false, 
        user: null, 
        token: null 
      }));
    }
  });

  useEffect(() => {
    // Définir un timeout pour éviter un blocage infini
    const timeoutId = setTimeout(() => {
      if (state.isLoading) {
        console.warn("Timeout de vérification d'authentification atteint, passage en mode non authentifié");
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }, 3000); // Réduit à 3 secondes pour accélérer le chargement en développement

    const verifyAuth = async () => {
      // Vérifier si nous sommes en mode développement local
      const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      // Récupérer le token du localStorage
      const token = localStorage.getItem("spotbulle_token");
      
      if (isDevelopment) {
        console.log("Mode développement local détecté, utilisation d'un utilisateur fictif");
        
        // En mode développement, on peut simuler un utilisateur connecté ou non
        if (token) {
          // Si un token existe, simuler un utilisateur connecté
          setState(prev => ({ 
            ...prev, 
            isAuthenticated: true, 
            user: mockUser, 
            token: "dev-token-123",
            isLoading: false 
          }));
        } else {
          // Sinon, utilisateur non connecté
          setState(prev => ({ 
            ...prev, 
            isAuthenticated: false, 
            user: null, 
            token: null,
            isLoading: false 
          }));
        }
        return;
      }
      
      // Code original pour l'environnement de production
      if (token) {
        try {
          console.log("Vérification de l'authentification avec le token existant");
          const user = await authService.getCurrentUser();
          console.log("Utilisateur authentifié:", user);
          setState(prev => ({ 
            ...prev, 
            isAuthenticated: true, 
            user, 
            token,
            isLoading: false 
          }));
        } catch (error) {
          console.error("Erreur lors de la vérification de l'authentification:", error);
          // En cas d'erreur, essayer de rafraîchir le token
          try {
            console.log("Tentative de rafraîchissement du token");
            const newToken = await authService.refreshToken();
            // Réessayer avec le nouveau token
            const user = await authService.getCurrentUser();
            setState(prev => ({ 
              ...prev, 
              isAuthenticated: true, 
              user, 
              token: newToken,
              isLoading: false 
            }));
          } catch (refreshError) {
            console.error("Échec du rafraîchissement du token:", refreshError);
            // Si le rafraîchissement échoue, déconnecter l'utilisateur
            localStorage.removeItem("spotbulle_token");
            setState(prev => ({ 
              ...prev, 
              isAuthenticated: false, 
              user: null, 
              token: null,
              isLoading: false 
            }));
          }
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    // Exécuter la vérification d'authentification avec gestion d'erreur
    verifyAuth().catch(error => {
      console.error("Erreur non gérée lors de la vérification d'authentification:", error);
      // S'assurer que l'application ne reste pas bloquée en cas d'erreur
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: false, 
        user: null, 
        token: null,
        isLoading: false 
      }));
    });

    // Nettoyer le timeout si le composant est démonté ou si la vérification est terminée
    return () => clearTimeout(timeoutId);
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
