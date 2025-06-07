import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, IUser } from '../services/api';
import { isTokenValid, isInDemoMode, clearTokens } from '../utils/auth';
import { logDebug, logError } from '../utils/debug';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<IUser | null>;
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
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const refreshUser = async () => {
    try {
      // Vérifier d'abord si le token est valide
      const token = localStorage.getItem('spotbulle_token');
      
      // Vérifier si on est en mode démo
      const demoMode = isInDemoMode();
      setIsDemoMode(demoMode);
      
      if (!isTokenValid(token) && !demoMode) {
        logDebug("Token invalide ou expiré, déconnexion...");
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
      
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      logError("Erreur lors de la récupération du profil:", error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await authService.loginUser({ email, password });
      
      // Vérifier si on est en mode démo après la connexion
      setIsDemoMode(isInDemoMode());
      
      await refreshUser();
      return true;
    } catch (error) {
      logError("Erreur de connexion:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsDemoMode(false);
    clearTokens();
  };

  // Fonction register
  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await authService.register({ email, password, full_name: fullName });
      
      // Connecter automatiquement l'utilisateur après l'inscription
      return await login(email, password);
    } catch (error) {
      logError("Erreur lors de l'inscription:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('spotbulle_token');
      
      // Vérifier si on est en mode démo
      const demoMode = isInDemoMode();
      setIsDemoMode(demoMode);
      
      if (!token && !demoMode) {
        setIsLoading(false);
        return;
      }
      
      try {
        await refreshUser();
      } catch (error) {
        logError("Erreur d'initialisation de l'authentification:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading,
      isDemoMode,
      login, 
      logout, 
      refreshUser,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
};

