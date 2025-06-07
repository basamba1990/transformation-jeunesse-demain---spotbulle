import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, IUser } from '../services/api';

interface AuthContextType {
  user: IUser | null;
  token: string | null; // ✅ Ajout de la propriété token manquante
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
  const [token, setToken] = useState<string | null>(null); // ✅ État pour le token
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      setUser(null);
      setIsAuthenticated(false);
      setToken(null); // ✅ Réinitialiser le token en cas d'erreur
      // Supprimer les tokens du localStorage si invalides
      localStorage.removeItem('spotbulle_token');
      localStorage.removeItem('spotbulle_refresh_token');
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const accessToken = await authService.loginUser({ email, password });
      setToken(accessToken); // ✅ Stocker le token dans l'état
      await refreshUser();
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null); // ✅ Réinitialiser le token
    setIsAuthenticated(false);
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      await authService.registerUser({ email, password, fullName });
      return true;
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem('spotbulle_token');
      
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      
      try {
        setToken(storedToken); // ✅ Définir le token depuis le localStorage
        await refreshUser();
      } catch (error) {
        console.error("Erreur d'initialisation de l'authentification:", error);
        // En cas d'erreur, nettoyer complètement l'état
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, // ✅ Fournir le token dans le contexte
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

