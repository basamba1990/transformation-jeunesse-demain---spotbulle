import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, IUser } from '../services/api';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
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
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await authService.loginUser({ email, password });
      await refreshUser();
      return true;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Fonction register
  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
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
      const token = localStorage.getItem('spotbulle_token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        await refreshUser();
      } catch (error) {
        console.error("Erreur d'initialisation de l'authentification:", error);
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
      login, 
      logout, 
      refreshUser,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
};

