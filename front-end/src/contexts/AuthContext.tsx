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
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
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

  // ✅ FONCTION D'INSCRIPTION AJUSTÉE
  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
    console.log('📝 Tentative d\'inscription via AuthContext...');
    setIsLoading(true);

    try {
      // Import dynamique pour éviter les dépendances circulaires
      const { authService } = await import('../services/api');
      
      // Formatage correct des données
      const userData = {
        email: email,
        password: password,
        full_name: fullName
      };
      
      console.log('📤 Données d\'inscription:', userData);
      const result = await authService.register(userData);
      
      console.log('🔍 Réponse complète du backend:', result);
      
      // ✅ VALIDATION AJUSTÉE : Vérifier différents formats de réponse
      if (result && (
        // Format 1: {success: true, user: {...}}
        (result.success === true && result.user) ||
        // Format 2: {user: {...}} (sans champ success)
        (result.user && !result.hasOwnProperty('success')) ||
        // Format 3: Réponse directe utilisateur
        (result.id && result.email) ||
        // Format 4: Status 200 avec message
        (result.message && result.message.includes('success'))
      )) {
        // Extraire l'utilisateur selon le format
        const userData = result.user || result;
        
        if (userData && userData.email) {
          setUser(userData);
          console.log('✅ Inscription réussie via AuthContext - Utilisateur:', userData.email);
          return true;
        }
      }
      
      // Si aucun format reconnu, considérer comme échec
      console.log('❌ Format de réponse non reconnu ou inscription échouée');
      console.log('📋 Détails de la réponse:', JSON.stringify(result, null, 2));
      return false;
      
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error);
      
      // ✅ GESTION SPÉCIALE : Si l'erreur contient un status 200, c'est peut-être un succès
      if (error.response && error.response.status === 200) {
        console.log('🔍 Status 200 détecté dans l\'erreur, analyse...');
        const responseData = error.response.data;
        
        if (responseData && (responseData.user || responseData.email)) {
          const userData = responseData.user || responseData;
          setUser(userData);
          console.log('✅ Inscription réussie malgré l\'erreur (Status 200)');
          return true;
        }
      }
      
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
    register, // ✅ FONCTION AJUSTÉE
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

