import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, type IUser } from "../services/api";

interface AuthContextType {
  user: IUser | null;
  token: string | null; // AJOUTÉ : Propriété token manquante
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null); // AJOUTÉ : État token
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour initialiser l'authentification
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const storedToken = localStorage.getItem("spotbulle_token");
      
      if (storedToken) {
        setToken(storedToken); // AJOUTÉ : Définir le token
        
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          console.log("Utilisateur authentifié:", userData);
        } catch (error) {
          console.error("Token invalide, nettoyage:", error);
          // Token invalide, nettoyer
          authService.logout();
          setToken(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Erreur initialisation auth:", error);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de connexion CORRIGÉE
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("Tentative de connexion...");
      
      const accessToken = await authService.loginUser({ email, password });
      setToken(accessToken); // AJOUTÉ : Définir le token
      
      // Récupérer les informations utilisateur
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      console.log("Connexion réussie:", userData);
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      setUser(null);
      setToken(null); // AJOUTÉ : Nettoyer le token
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion CORRIGÉE
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null); // AJOUTÉ : Nettoyer le token
    console.log("Déconnexion effectuée");
  };

  // Fonction pour rafraîchir les données utilisateur
  const refreshUser = async (): Promise<void> => {
    try {
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error("Erreur rafraîchissement utilisateur:", error);
      // En cas d'erreur, déconnecter
      logout();
    }
  };

  // Initialiser l'authentification au montage
  useEffect(() => {
    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    token, // AJOUTÉ : Inclure token dans la valeur
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

