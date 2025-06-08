import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

// Types pour l'utilisateur
interface User {
  id: number;
  email: string;
  full_name: string;
  bio?: string;
  interests?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at?: string;
}

// Types pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Fournisseur du contexte d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialisation de l'authentification au chargement
  useEffect(() => {
    initializeAuth();
  }, []);

  // Fonction d'initialisation de l'authentification
  const initializeAuth = async () => {
    console.log('🔄 Initialisation de l\'authentification...');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ Aucun token trouvé');
        setLoading(false);
        return;
      }

      console.log('🔍 Token trouvé, récupération du profil utilisateur...');
      
      // Récupérer le profil utilisateur
      const userData = await authService.getProfile();
      
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ Utilisateur récupéré:', { email: userData.email, full_name: userData.full_name, id: userData.id, is_active: userData.is_active, is_superuser: userData.is_superuser });
        console.log('✅ Authentification automatique réussie');
      } else {
        console.log('❌ Impossible de récupérer le profil utilisateur');
        // Nettoyer les tokens invalides
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de l\'authentification:', error);
      // Nettoyer les tokens en cas d'erreur
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
      console.log('✅ Initialisation de l\'authentification terminée');
    }
  };

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Tentative de connexion pour:', email);
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      
      if (response.access_token) {
        // Stocker les tokens
        localStorage.setItem('token', response.access_token);
        if (response.refresh_token) {
          localStorage.setItem('refreshToken', response.refresh_token);
        }
        console.log('✅ Tokens stockés avec succès');

        // Récupérer et définir les données utilisateur
        let userData = response.user;
        if (!userData) {
          console.log('🔍 Récupération des données utilisateur...');
          userData = await authService.getProfile();
        }

        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ Utilisateur récupéré:', { email: userData.email, full_name: userData.full_name, id: userData.id, is_active: userData.is_active, is_superuser: userData.is_superuser });
          console.log('✅ Authentification complète');
          return true;
        } else {
          console.error('❌ Impossible de récupérer les données utilisateur');
          return false;
        }
      } else {
        console.error('❌ Aucun token d\'accès reçu');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion:', error);
      
      // Gestion des erreurs spécifiques
      if (error.response?.status === 401) {
        throw new Error('Identifiants incorrects');
      } else if (error.response?.status >= 500) {
        throw new Error('Erreur serveur, veuillez réessayer');
      } else {
        throw new Error('Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData: RegisterData): Promise<boolean> => {
    console.log('📝 Tentative d\'inscription pour:', userData.email);
    setLoading(true);

    try {
      const response = await authService.register(userData);
      
      if (response) {
        console.log('✅ Inscription réussie:', { email: userData.email, full_name: userData.full_name });
        
        // Optionnel : connecter automatiquement après inscription
        if (response.access_token) {
          localStorage.setItem('token', response.access_token);
          if (response.refresh_token) {
            localStorage.setItem('refreshToken', response.refresh_token);
          }
          
          setUser(response.user);
          setIsAuthenticated(true);
          console.log('✅ Connexion automatique après inscription');
        }
        
        return true;
      } else {
        console.error('❌ Réponse d\'inscription invalide');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      
      // Gestion des erreurs spécifiques
      if (error.message?.includes('Email déjà utilisé')) {
        throw new Error('Cette adresse email est déjà utilisée');
      } else if (error.response?.status === 400) {
        throw new Error('Données d\'inscription invalides');
      } else {
        throw new Error('Erreur lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    console.log('🚪 Déconnexion de l\'utilisateur');
    
    // Nettoyer l'état local
    setUser(null);
    setIsAuthenticated(false);
    
    // Nettoyer le stockage local
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Appeler le service de déconnexion (optionnel)
    authService.logout().catch(error => {
      console.warn('⚠️ Erreur lors de la déconnexion côté serveur:', error);
    });
    
    console.log('✅ Déconnexion terminée');
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    console.log('📝 Mise à jour du profil utilisateur');
    
    if (!user) {
      throw new Error('Aucun utilisateur connecté');
    }

    try {
      const updatedUser = await authService.updateProfile(profileData);
      
      // Mettre à jour l'état local avec les nouvelles données
      setUser(prevUser => ({
        ...prevUser!,
        ...updatedUser,
      }));
      
      console.log('✅ Profil mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du profil:', error);
      throw new Error('Impossible de mettre à jour le profil');
    }
  };

  // Fonction pour rafraîchir les données utilisateur
  const refreshUser = async (): Promise<void> => {
    console.log('🔄 Rafraîchissement des données utilisateur');
    
    if (!isAuthenticated) {
      console.log('❌ Utilisateur non authentifié');
      return;
    }

    try {
      const userData = await authService.getProfile();
      
      if (userData) {
        setUser(userData);
        console.log('✅ Données utilisateur rafraîchies');
      } else {
        console.error('❌ Impossible de rafraîchir les données utilisateur');
      }
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
      // En cas d'erreur d'authentification, déconnecter l'utilisateur
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Valeur du contexte
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Export par défaut du contexte
export default AuthContext;

