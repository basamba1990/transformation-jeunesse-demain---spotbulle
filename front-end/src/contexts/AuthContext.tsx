import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, refreshToken } from '../services/api';

// Types TypeScript
interface User {
  id: number;
  email: string;
  full_name: string;
  bio?: string;
  avatar?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>; // ✅ AJOUTÉ
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider du contexte d'authentification
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérification de l'authentification au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔐 Initialisation de l\'authentification...');
      setIsLoading(true);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('❌ Aucun token trouvé');
          setIsLoading(false);
          return;
        }

        console.log('🔍 Token trouvé, récupération de l\'utilisateur...');
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          console.log('✅ Utilisateur authentifié:', currentUser.email);
        } else {
          console.log('❌ Impossible de récupérer l\'utilisateur');
          // Nettoyage en cas d'échec
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('❌ Erreur initialisation auth:', error);
        // Nettoyage en cas d'erreur
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
        console.log('✅ Initialisation authentification terminée');
      }
    };

    initializeAuth();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Tentative de connexion via AuthContext...');
    setIsLoading(true);

    try {
      // Import dynamique pour éviter les dépendances circulaires
      const { authService } = await import('../services/api');
      
      const result = await authService.login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        console.log('✅ Connexion réussie via AuthContext');
        return true;
      } else {
        console.log('❌ Échec de connexion');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NOUVELLE FONCTION D'INSCRIPTION
  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
    console.log('📝 Tentative d\'inscription via AuthContext...');
    setIsLoading(true);

    try {
      // Import dynamique pour éviter les dépendances circulaires
      const { authService } = await import('../services/api');
      
      const result = await authService.register(email, password, fullName);
      
      if (result.success && result.user) {
        setUser(result.user);
        console.log('✅ Inscription réussie via AuthContext');
        return true;
      } else {
        console.log('❌ Échec de l\'inscription');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    console.log('👋 Déconnexion via AuthContext...');
    setIsLoading(true);

    try {
      // Import dynamique pour éviter les dépendances circulaires
      const { authService } = await import('../services/api');
      
      await authService.logout();
      setUser(null);
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
      // Nettoyage local même en cas d'erreur
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de mise à jour de l'utilisateur
  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ Utilisateur mis à jour:', updatedUser);
    }
  };

  // Rafraîchissement automatique du token
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        console.log('🔄 Rafraîchissement automatique du token...');
        const newToken = await refreshToken();
        if (newToken) {
          console.log('✅ Token rafraîchi automatiquement');
        } else {
          console.log('❌ Échec du rafraîchissement, déconnexion');
          await logout();
        }
      } catch (error) {
        console.error('❌ Erreur rafraîchissement auto:', error);
        await logout();
      }
    }, 15 * 60 * 1000); // Toutes les 15 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Valeurs du contexte
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register, // ✅ AJOUTÉ
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

