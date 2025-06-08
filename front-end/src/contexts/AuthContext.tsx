import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, IUser } from '../services/api';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      console.log("🔄 Récupération des données utilisateur...");
      const userData = await authService.getCurrentUser();
      console.log("✅ Utilisateur récupéré:", userData);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du profil:", error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 Tentative de connexion pour:", email);
      await authService.loginUser({ email, password });
      console.log("✅ Connexion réussie, récupération du profil...");
      await refreshUser();
      console.log("✅ Authentification complète");
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("🚪 Déconnexion...");
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    console.log("✅ Déconnexion terminée");
  };

  // ✅ CORRECTION : Utiliser authService.register au lieu de authService.registerUser
  const register = async (email: string, password: string, fullName: string) => {
    try {
      console.log("📝 Tentative d'inscription pour:", email);
      
      // ✅ UTILISATION DE LA BONNE FONCTION
      const result = await authService.register({ 
        email, 
        password, 
        full_name: fullName 
      });
      
      console.log("✅ Inscription réussie:", result);
      return true;
    } catch (error: any) {
      console.error("❌ Erreur lors de l'inscription:", error);
      
      // Propager l'erreur avec un message plus informatif
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("L'inscription a échoué. Veuillez réessayer.");
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log("🚀 Initialisation de l'authentification...");
      setIsLoading(true);
      
      // Vérifier si un token existe
      const token = localStorage.getItem('spotbulle_token');
      
      if (!token) {
        console.log("ℹ️ Aucun token trouvé, utilisateur non connecté");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("🔍 Token trouvé, vérification de la validité...");
        await refreshUser();
        console.log("✅ Authentification automatique réussie");
      } catch (error) {
        console.error("❌ Erreur d'initialisation de l'authentification:", error);
        // Nettoyer le token invalide
        localStorage.removeItem('spotbulle_token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        console.log("✅ Initialisation de l'authentification terminée");
      }
    };
    
    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout, 
      refreshUser,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
};

