// Configuration de la base URL de l'API - CORRIGÉE POUR VITE
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://spotbulle-backend-0lax.onrender.com/api/v1';

// Configuration axios avec intercepteurs
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes pour Render
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log de la configuration pour debugging
console.log('🔗 Configuration API SpotBulle:');
console.log('📍 URL de base:', API_BASE_URL);
console.log('🔧 Variable d\'environnement:', import.meta.env.VITE_API_BASE_URL);
console.log('⏱️ Timeout configuré:', '30 secondes');

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spotbulle_token');
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
      localStorage.removeItem('spotbulle_token');
      localStorage.removeItem('spotbulle_refreshToken');
      // Redirection vers login sera gérée par AuthContext
    }
    
    return Promise.reject(error);
  }
);

// ===== SERVICES API =====

// Service d'authentification
const authService = {
  // Connexion utilisateur
  login: async (email: string, password: string) => {
    console.log('🔐 Tentative de connexion pour:', email);
    
    try {
      console.log('📤 Envoi requête de connexion...');
      const response = await api.post('/auth/login', {
        username: email, // Backend attend 'username'
        password: password
      });
      
      console.log('✅ Connexion réussie');
      
      // Stockage des tokens
      if (response.data.access_token) {
        localStorage.setItem('spotbulle_token', response.data.access_token);
        console.log('💾 Token d\'accès stocké');
      }
      
      if (response.data.refresh_token) {
        localStorage.setItem('spotbulle_refreshToken', response.data.refresh_token);
        console.log('💾 Token de rafraîchissement stocké');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    }
  },

  // Inscription utilisateur
  register: async (userData: any) => {
    console.log('📝 Inscription nouvel utilisateur:', userData.email);
    
    try {
      console.log('📤 Envoi requête d\'inscription...');
      const response = await api.post('/auth/register', userData);
      console.log('✅ Inscription réussie');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      throw error;
    }
  },

  // Récupération du profil utilisateur
  getProfile: async () => {
    console.log('👤 Récupération du profil utilisateur');
    
    try {
      console.log('📤 Envoi requête profil...');
      const response = await api.get('/auth/me');
      console.log('✅ Profil récupéré');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      throw error;
    }
  },

  // Fonction getCurrentUser pour compatibilité avec ProtectedRoute
  getCurrentUser: async () => {
    return authService.getProfile();
  },

  // Fonction refreshToken pour compatibilité avec ProtectedRoute
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('spotbulle_refreshToken');
    if (!refreshToken) {
      throw new Error('Aucun refresh token disponible');
    }
    
    try {
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken
      });
      
      localStorage.setItem('spotbulle_token', response.data.access_token);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur refresh token:', error);
      throw error;
    }
  },

  // Mise à jour du profil
  updateProfile: async (profileData: any) => {
    console.log('📝 Mise à jour du profil');
    
    try {
      console.log('📤 Envoi mise à jour profil...');
      const response = await api.put('/auth/profile', profileData);
      console.log('✅ Profil mis à jour');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      throw error;
    }
  },

  // Déconnexion
  logout: async () => {
    console.log('🚪 Déconnexion utilisateur');
    localStorage.removeItem('spotbulle_token');
    localStorage.removeItem('spotbulle_refreshToken');
    return { message: 'Déconnexion réussie' };
  },
};

// Service de gestion des pods
const podService = {
  // Récupération de tous les pods
  getAll: async () => {
    console.log('🎧 Récupération de tous les pods');
    
    try {
      const response = await api.get('/pods');
      console.log('✅ Pods récupérés');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération pods:', error);
      throw error;
    }
  },

  // Récupération des pods de l'utilisateur
  getMy: async () => {
    console.log('🎧 Récupération de mes pods');
    
    try {
      const response = await api.get('/pods/my');
      console.log('✅ Mes pods récupérés');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération mes pods:', error);
      throw error;
    }
  },

  // Création d'un nouveau pod
  create: async (podData: any) => {
    console.log('🎧 Création nouveau pod');
    
    try {
      const response = await api.post('/pods', podData);
      console.log('✅ Pod créé');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création pod:', error);
      throw error;
    }
  },

  // Upload d'un fichier audio
  uploadAudio: async (file: File) => {
    console.log('🎵 Upload fichier audio');
    
    const formData = new FormData();
    formData.append('audio', file);
    
    try {
      const response = await api.post('/pods/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Audio uploadé');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur upload audio:', error);
      throw error;
    }
  },
};

// Service de gestion des matches
const matchService = {
  // Récupération des matches
  getAll: async () => {
    console.log('💕 Récupération des matches');
    
    try {
      const response = await api.get('/matches');
      console.log('✅ Matches récupérés');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération matches:', error);
      throw error;
    }
  },

  // Accepter un match
  accept: async (matchId: string) => {
    console.log('✅ Acceptation du match:', matchId);
    
    try {
      const response = await api.post(`/matches/${matchId}/accept`);
      console.log('✅ Match accepté');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur acceptation match:', error);
      throw error;
    }
  },

  // Refuser un match
  reject: async (matchId: string) => {
    console.log('❌ Refus du match:', matchId);
    
    try {
      const response = await api.post(`/matches/${matchId}/reject`);
      console.log('✅ Match refusé');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur refus match:', error);
      throw error;
    }
  },
};

// Service de gestion des vidéos
const videoService = {
  // Récupération des vidéos
  getAll: async () => {
    console.log('🎬 Récupération des vidéos');
    
    try {
      const response = await api.get('/videos');
      console.log('✅ Vidéos récupérées');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération vidéos:', error);
      throw error;
    }
  },

  // Upload d'une vidéo
  upload: async (file: File) => {
    console.log('🎬 Upload vidéo');
    
    const formData = new FormData();
    formData.append('video', file);
    
    try {
      const response = await api.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Vidéo uploadée');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur upload vidéo:', error);
      throw error;
    }
  },

  // Traitement d'une vidéo
  process: async (videoId: string) => {
    console.log('⚙️ Traitement vidéo:', videoId);
    
    try {
      const response = await api.post(`/videos/${videoId}/process`);
      console.log('✅ Vidéo traitée');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur traitement vidéo:', error);
      throw error;
    }
  },
};

// Service de transcription
const transcriptionService = {
  // Transcription d'un fichier audio
  transcribe: async (file: File) => {
    console.log('📝 Transcription audio');
    
    const formData = new FormData();
    formData.append('audio', file);
    
    try {
      const response = await api.post('/transcription/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Transcription terminée');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur transcription:', error);
      throw error;
    }
  },

  // Récupération des transcriptions
  getAll: async () => {
    console.log('📝 Récupération des transcriptions');
    
    try {
      const response = await api.get('/transcription');
      console.log('✅ Transcriptions récupérées');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération transcriptions:', error);
      throw error;
    }
  },
};

// Service DISC
const discService = {
  // Soumission du questionnaire DISC
  submit: async (answers: any) => {
    console.log('📊 Soumission questionnaire DISC');
    
    try {
      const response = await api.post('/disc/submit', answers);
      console.log('✅ Questionnaire DISC soumis');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur soumission DISC:', error);
      throw error;
    }
  },

  // Récupération du profil DISC
  getProfile: async () => {
    console.log('📊 Récupération profil DISC');
    
    try {
      const response = await api.get('/disc/profile');
      console.log('✅ Profil DISC récupéré');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération profil DISC:', error);
      throw error;
    }
  },
};

// Service IA
const aiService = {
  // Chat avec l'IA
  chat: async (message: string) => {
    console.log('🤖 Chat avec IA');
    
    try {
      const response = await api.post('/ai/chat', { message });
      console.log('✅ Réponse IA reçue');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur chat IA:', error);
      throw error;
    }
  },

  // Analyse de personnalité
  analyzePersonality: async (data: any) => {
    console.log('🧠 Analyse de personnalité');
    
    try {
      const response = await api.post('/ai/analyze', data);
      console.log('✅ Analyse terminée');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur analyse:', error);
      throw error;
    }
  },
};

// Service de profils
const profileService = {
  // Recherche de profils
  search: async (criteria: any) => {
    console.log('🔍 Recherche de profils');
    
    try {
      const response = await api.post('/profiles/search', criteria);
      console.log('✅ Profils trouvés');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur recherche profils:', error);
      throw error;
    }
  },

  // Récupération d'un profil
  getById: async (profileId: string) => {
    console.log('👤 Récupération profil:', profileId);
    
    try {
      const response = await api.get(`/profiles/${profileId}`);
      console.log('✅ Profil récupéré');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      throw error;
    }
  },
};

// Service de gestion des images
const imageService = {
  // Upload d'une image
  upload: async (file: File) => {
    console.log('🖼️ Upload image');
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Image uploadée');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur upload image:', error);
      throw error;
    }
  },

  // Redimensionner une image
  resize: async (imageId: string, width: number, height: number) => {
    console.log('🔄 Redimensionnement image:', imageId);
    
    try {
      const response = await api.post(`/images/${imageId}/resize`, { width, height });
      console.log('✅ Image redimensionnée');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur redimensionnement:', error);
      throw error;
    }
  },
};

// ===== EXPORT PRINCIPAL =====

// Export de l'instance axios configurée
export { api };

// Export des fonctions pour compatibilité avec AuthContext
export const getCurrentUser = authService.getCurrentUser;
export const refreshToken = authService.refreshToken;

// Export par défaut de tous les services
export default {
  auth: authService,
  pods: podService,
  matches: matchService,
  videos: videoService,
  transcription: transcriptionService,
  disc: discService,
  ai: aiService,
  profiles: profileService,
  images: imageService,
};

// Logs de démarrage
console.log('🚀 Services API SpotBulle initialisés');
console.log('🔗 URL de base:', API_BASE_URL);
console.log('🔧 Variable d\'environnement Vite:', import.meta.env.VITE_API_BASE_URL);
console.log('⏱️ Timeout configuré:', '30 secondes');
console.log('🔧 Mode:', import.meta.env.MODE || 'development');

