// Configuration de la base URL de l'API - VERSION PRODUCTION PURE
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://spotbulle-backend-0lax.onrender.com/api/v1';

// Configuration axios optimisée pour la production
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes pour Render
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log de la configuration pour debugging
console.log('🔗 Configuration API SpotBulle PRODUCTION:');
console.log('📍 URL de base:', API_BASE_URL);
console.log('🔧 Variable d\'environnement:', import.meta.env.VITE_API_BASE_URL);
console.log('⏱️ Timeout configuré:', '30 secondes');
console.log('🎯 Mode:', 'PRODUCTION UNIQUEMENT (pas de fallback démo)');

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Requête API:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Erreur intercepteur request:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse API reçue:', response.config.url, '- Status:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Erreur API:', error.response?.status, error.config?.url);
    console.error('📝 Détails erreur:', error.message);
    
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      console.log('🔐 Token expiré, nettoyage de la session');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Redirection vers login sera gérée par l'AuthContext
    }
    
    // Gestion des erreurs serveur
    if (error.response?.status >= 500) {
      console.error('🚨 Erreur serveur backend:', error.response.status);
      throw new Error(`Erreur serveur: ${error.response.status}. Veuillez réessayer plus tard.`);
    }
    
    // Gestion des erreurs client
    if (error.response?.status >= 400 && error.response?.status < 500) {
      console.error('⚠️ Erreur client:', error.response.status);
      const message = error.response.data?.detail || error.response.data?.message || 'Erreur de requête';
      throw new Error(message);
    }
    
    // Erreurs de réseau
    if (!error.response) {
      console.error('🌐 Erreur de réseau ou serveur inaccessible');
      throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
    }
    
    return Promise.reject(error);
  }
);

// ===== SERVICES D'AUTHENTIFICATION =====

export const authService = {
  // Connexion utilisateur
  login: async (email: string, password: string) => {
    console.log('🔐 Tentative de connexion PRODUCTION...');
    console.log('🔐 Email:', email);
    console.log('🌐 URL backend:', API_BASE_URL);
    
    try {
      console.log('📤 Envoi requête de connexion...');
      
      // Format form-data pour FastAPI OAuth2
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/auth/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('✅ Réponse backend reçue');
      
      if (response.data.access_token) {
        const token = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        
        // Stockage sécurisé
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Récupération du profil utilisateur
        const userResponse = await api.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const user = userResponse.data;
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('✅ Connexion backend réussie');
        console.log('👤 Utilisateur:', user);
        
        return {
          success: true,
          user: user,
          token: token
        };
      } else {
        throw new Error('Token d\'accès non reçu du serveur');
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error.message);
      throw error; // Propagation de l'erreur sans fallback
    }
  },

  // Inscription utilisateur
  register: async (userData: {
    full_name: string;
    email: string;
    password: string;
  }) => {
    console.log('📝 Tentative d\'inscription PRODUCTION...');
    console.log('📝 Email:', userData.email);
    console.log('🌐 URL backend:', API_BASE_URL);
    
    try {
      console.log('📤 Envoi requête d\'inscription...');
      const response = await api.post('/auth/register', userData);
      console.log('✅ Inscription réussie');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur inscription:', error.message);
      throw error; // Propagation de l'erreur sans fallback
    }
  },

  // Déconnexion
  logout: async () => {
    console.log('👋 Déconnexion en cours...');
    
    try {
      // Tentative de déconnexion backend
      await api.post('/auth/logout');
      console.log('✅ Déconnexion backend réussie');
    } catch (error) {
      console.log('⚠️ Déconnexion backend échouée, nettoyage local');
    }
    
    // Nettoyage local dans tous les cas
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    console.log('✅ Session nettoyée');
    return { success: true };
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ Aucun token trouvé');
        return null;
      }

      console.log('🔍 Récupération utilisateur backend...');
      const response = await api.get('/auth/me');
      console.log('✅ Utilisateur backend récupéré:', response.data);
      
      // Mise à jour du stockage local
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error.message);
      
      // En cas d'erreur, nettoyer la session
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return null;
    }
  },

  // Rafraîchir le token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('❌ Aucun refresh token trouvé');
        return null;
      }

      console.log('🔄 Rafraîchissement token backend...');
      const response = await api.post('/auth/refresh', { 
        refresh_token: refreshToken 
      });
      
      const newToken = response.data.access_token;
      const newRefreshToken = response.data.refresh_token;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      console.log('✅ Token backend rafraîchi');
      return newToken;
      
    } catch (error) {
      console.error('❌ Erreur rafraîchissement token:', error.message);
      
      // En cas d'erreur, nettoyer la session
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return null;
    }
  }
};

// ===== SERVICES DE PROFIL =====

export const profileService = {
  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      console.log('✅ Profil backend récupéré');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error.message);
      throw error;
    }
  },

  updateProfile: async (data: any) => {
    try {
      const response = await api.put('/profile', data);
      console.log('✅ Profil mis à jour (backend)');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error.message);
      throw error;
    }
  }
};

// ===== SERVICES DE PODS =====

export const podService = {
  fetchAll: async () => {
    try {
      const response = await api.get('/pods');
      console.log('✅ Pods backend récupérés');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération pods:', error.message);
      throw error;
    }
  },

  create: async (podData: any) => {
    try {
      const response = await api.post('/pods', podData);
      console.log('✅ Pod créé (backend)');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création pod:', error.message);
      throw error;
    }
  },

  delete: async (podId: number) => {
    try {
      const response = await api.delete(`/pods/${podId}`);
      console.log('✅ Pod supprimé (backend)');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur suppression pod:', error.message);
      throw error;
    }
  }
};

// ===== SERVICES DE MATCHING =====

export const matchService = {
  getMatches: async () => {
    try {
      const response = await api.get('/matches');
      console.log('✅ Matches backend récupérés');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération matches:', error.message);
      throw error;
    }
  },

  acceptMatch: async (matchId: number) => {
    try {
      const response = await api.post(`/matches/${matchId}/accept`);
      console.log('✅ Match accepté (backend)');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur acceptation match:', error.message);
      throw error;
    }
  },

  rejectMatch: async (matchId: number) => {
    try {
      const response = await api.post(`/matches/${matchId}/reject`);
      console.log('✅ Match rejeté (backend)');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur rejet match:', error.message);
      throw error;
    }
  }
};

// ===== SERVICES VIDÉO =====

export const videoService = {
  uploadVideo: async (videoData: any) => {
    try {
      const response = await api.post('/videos/upload', videoData, {
        timeout: 60000, // 1 minute pour l'upload
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Vidéo uploadée (backend)');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur upload vidéo:', error.message);
      throw error;
    }
  },

  getVideos: async () => {
    try {
      const response = await api.get('/videos');
      console.log('✅ Vidéos récupérées (backend)');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération vidéos:', error.message);
      throw error;
    }
  }
};

// ===== SERVICES DE TRANSCRIPTION =====

export const transcriptionService = {
  transcribeAudio: async (audioData: any) => {
    try {
      const response = await api.post('/transcription', audioData, {
        timeout: 120000, // 2 minutes pour la transcription
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Transcription réalisée (backend)');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur transcription:', error.message);
      throw error;
    }
  }
};

// ===== SERVICES DISC =====

export const discService = {
  getDiscProfile: async () => {
    try {
      const response = await api.get('/disc/profile');
      console.log('✅ Profil DISC récupéré (backend)');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur profil DISC:', error.message);
      throw error;
    }
  },

  takeAssessment: async (answers: any) => {
    try {
      const response = await api.post('/disc/assessment', { answers });
      console.log('✅ Évaluation DISC soumise (backend)');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur évaluation DISC:', error.message);
      throw error;
    }
  }
};

// ===== SERVICES IA =====

export const aiService = {
  getRecommendations: async () => {
    try {
      const response = await api.get('/ai/recommendations');
      console.log('✅ Recommandations IA récupérées (backend)');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur recommandations IA:', error.message);
      throw error;
    }
  },

  analyzeContent: async (content: string) => {
    try {
      const response = await api.post('/ai/analyze', { content });
      console.log('✅ Analyse IA réalisée (backend)');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur analyse IA:', error.message);
      throw error;
    }
  }
};

// ===== EXPORTS PRINCIPAUX =====

// Export des fonctions critiques pour l'AuthContext
export const getCurrentUser = authService.getCurrentUser;
export const refreshToken = authService.refreshToken;

// Export par défaut
export default {
  auth: authService,
  profile: profileService,
  pods: podService,
  matches: matchService,
  videos: videoService,
  transcription: transcriptionService,
  disc: discService,
  ai: aiService,
  getCurrentUser,
  refreshToken
};

console.log('🚀 Services API SpotBulle PRODUCTION initialisés');
console.log('✅ Mode: BACKEND UNIQUEMENT (pas de fallback démo)');
console.log('🔗 URL backend:', API_BASE_URL);

