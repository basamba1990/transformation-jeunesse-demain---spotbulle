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
      // Utiliser la fonction de déconnexion du service d'authentification
      // pour s'assurer que tous les tokens sont supprimés
      authService.logout();
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: false, 
        user: null, 
        token: null 
      }));
    }
  });

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("spotbulle_token");
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
            authService.logout();
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
    verifyAuth();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
