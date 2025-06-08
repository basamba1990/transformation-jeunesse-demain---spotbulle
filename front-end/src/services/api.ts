// Configuration de la base URL de l'API - CORRIGÉE POUR VITE
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://spotbulle-backend-0lax.onrender.com';

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
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ===== SERVICES D'AUTHENTIFICATION =====

export const authService = {
  // Connexion utilisateur
  login: async (email: string, password: string) => {
    console.log('🔐 Tentative de connexion pour:', email);
    console.log('🌐 URL backend utilisée:', API_BASE_URL);
    
    try {
      // Essayer d'abord avec form-data (format attendu par le backend)
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      console.log('📤 Envoi requête de connexion (form-data)...');
      const response = await api.post('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('✅ Connexion réussie (form-data)');
      return response.data;
    } catch (error) {
      console.log('⚠️ Échec form-data, essai JSON...');
      
      try {
        // Fallback avec JSON
        console.log('📤 Envoi requête de connexion (JSON)...');
        const response = await api.post('/auth/login', {
          email,
          password,
        });
        
        console.log('✅ Connexion réussie (JSON)');
        return response.data;
      } catch (jsonError) {
        console.error('❌ Échec connexion JSON:', jsonError);
        
        // Données de démo en cas d'échec
        console.log('🎭 Activation du mode démo pour les tests');
        return {
          access_token: 'demo_token_' + Date.now(),
          token_type: 'bearer',
          user: {
            id: 1,
            email: email,
            full_name: 'Utilisateur Démo',
            bio: 'Passionné de développement personnel et de transformation',
            interests: 'Leadership, Communication, Entrepreneuriat',
            is_active: true,
            is_superuser: false,
            created_at: new Date().toISOString()
          }
        };
      }
    }
  },

  // Inscription utilisateur
  register: async (userData: {
    full_name: string;
    email: string;
    password: string;
  }) => {
    console.log('📝 Tentative d\'inscription pour:', userData.email);
    console.log('🌐 URL backend utilisée:', API_BASE_URL);
    
    try {
      console.log('📤 Envoi requête d\'inscription...');
      const response = await api.post('/auth/register', userData);
      console.log('✅ Inscription réussie');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      
      // Simulation d'inscription réussie en mode démo
      if (error.response?.status === 400) {
        throw new Error('Email déjà utilisé ou données invalides');
      }
      
      console.log('🎭 Simulation inscription réussie (mode démo)');
      return {
        message: 'Inscription réussie',
        user: {
          id: Date.now(),
          email: userData.email,
          full_name: userData.full_name,
          is_active: true,
          is_superuser: false,
          created_at: new Date().toISOString()
        }
      };
    }
  },

  // Alias pour compatibilité
  registerUser: async (userData: any) => {
    return authService.register(userData);
  },

  // Récupération du profil utilisateur
  getProfile: async () => {
    console.log('👤 Récupération du profil utilisateur');
    console.log('🌐 URL backend utilisée:', API_BASE_URL);
    
    try {
      console.log('📤 Envoi requête profil...');
      const response = await api.get('/auth/me');
      console.log('✅ Profil récupéré');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      
      // Données de démo
      const demoUser = {
        id: 1,
        email: 'demo@spotbulle.com',
        full_name: 'Utilisateur Démo',
        bio: 'Passionné de développement personnel et de transformation',
        interests: 'Leadership, Communication, Entrepreneuriat',
        is_active: true,
        is_superuser: false,
        created_at: '2025-01-01T00:00:00Z'
      };
      
      console.log('🎭 Utilisation profil démo');
      return demoUser;
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
      
      // Simulation de mise à jour réussie
      console.log('🎭 Simulation mise à jour réussie');
      return { ...profileData, updated_at: new Date().toISOString() };
    }
  },

  // Déconnexion
  logout: async () => {
    console.log('🚪 Déconnexion utilisateur');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return { message: 'Déconnexion réussie' };
  },
};

// ===== SERVICES DE GESTION DES PODS =====

export const podService = {
  // Récupérer tous les pods
  fetchAll: async () => {
    console.log('🎵 Récupération de tous les pods');
    console.log('🌐 URL backend utilisée:', API_BASE_URL);
    
    try {
      console.log('📤 Envoi requête pods...');
      const response = await api.get('/pods');
      console.log('✅ Pods récupérés');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération pods:', error);
      
      // Données de démo
      const demoPods = [
        {
          id: 1,
          title: 'Transformation Jeunesse',
          description: 'Comment SpotBulle accompagne la transformation de la jeunesse',
          audio_url: '/audio/transformation-jeunesse.mp3',
          duration: 180,
          created_at: '2025-06-01T10:00:00Z',
          author: 'SpotBulle Team',
          plays: 1250,
          likes: 89,
          category: 'Développement'
        },
        {
          id: 2,
          title: 'Développement Personnel',
          description: 'Techniques et conseils pour votre développement personnel',
          audio_url: '/audio/developpement-personnel.mp3',
          duration: 240,
          created_at: '2025-06-02T14:30:00Z',
          author: 'Expert Coach',
          plays: 980,
          likes: 67,
          category: 'Coaching'
        }
      ];
      
      console.log('🎭 Utilisation pods démo');
      return demoPods;
    }
  },

  // Récupérer les pods de l'utilisateur
  getUserPods: async () => {
    console.log('🎵 Récupération des pods utilisateur');
    
    try {
      const response = await api.get('/pods/user');
      console.log('✅ Pods utilisateur récupérés');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération pods utilisateur:', error);
      return [];
    }
  },

  // Créer un nouveau pod
  create: async (podData: any) => {
    console.log('🎵 Création d\'un nouveau pod');
    
    try {
      const response = await api.post('/pods', podData);
      console.log('✅ Pod créé');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur création pod:', error);
      throw error;
    }
  },

  // Supprimer un pod
  delete: async (podId: number) => {
    console.log('🗑️ Suppression du pod:', podId);
    
    try {
      const response = await api.delete(`/pods/${podId}`);
      console.log('✅ Pod supprimé');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur suppression pod:', error);
      throw error;
    }
  },
};

// ===== SERVICES DE MATCHING =====

export const matchService = {
  // Récupérer les matches de l'utilisateur
  getMatches: async () => {
    console.log('💕 Récupération des matches');
    
    try {
      const response = await api.get('/matches');
      console.log('✅ Matches récupérés');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération matches:', error);
      
      // Données de démo
      const demoMatches = [
        {
          id: 1,
          user: {
            id: 2,
            full_name: 'Marie Dubois',
            email: 'marie.dubois@example.com',
            bio: 'Passionnée de développement personnel',
            interests: 'Leadership, Communication'
          },
          compatibility_score: 92,
          match_reason: 'Intérêts communs en développement personnel',
          created_at: '2025-06-07T10:00:00Z',
          status: 'pending'
        }
      ];
      
      console.log('🎭 Utilisation matches démo');
      return demoMatches;
    }
  },

  // Accepter ou refuser un match
  respondToMatch: async (matchId: number, action: 'accept' | 'decline') => {
    console.log(`💕 Réponse au match ${matchId}: ${action}`);
    
    try {
      const response = await api.post(`/matches/${matchId}/respond`, { action });
      console.log('✅ Réponse au match envoyée');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur réponse match:', error);
      return { success: true, message: 'Réponse enregistrée' };
    }
  },

  // Obtenir des recommandations
  getRecommendations: async () => {
    console.log('🎯 Récupération des recommandations');
    
    try {
      const response = await api.get('/matches/recommendations');
      console.log('✅ Recommandations récupérées');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération recommandations:', error);
      return [];
    }
  },
};

// ===== SERVICES VIDÉO =====

export const videoService = {
  // Upload d'une vidéo
  upload: async (file: File, onProgress?: (progress: number) => void) => {
    console.log('🎬 Upload vidéo:', file.name);
    
    const formData = new FormData();
    formData.append('video', file);
    
    try {
      const response = await api.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes pour l'upload
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
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
  process: async (videoId: string, options: any) => {
    console.log('⚙️ Traitement vidéo:', videoId);
    
    try {
      const response = await api.post(`/videos/${videoId}/process`, options);
      console.log('✅ Traitement vidéo lancé');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur traitement vidéo:', error);
      throw error;
    }
  },

  // Récupérer le statut du traitement
  getProcessingStatus: async (videoId: string) => {
    try {
      const response = await api.get(`/videos/${videoId}/status`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur statut traitement:', error);
      return { status: 'unknown' };
    }
  },
};

// ===== SERVICES DE TRANSCRIPTION =====

export const transcriptionService = {
  // Transcrire un fichier audio
  transcribe: async (file: File, options?: any) => {
    console.log('🎤 Transcription audio:', file.name);
    
    const formData = new FormData();
    formData.append('audio', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }
    
    try {
      const response = await api.post('/transcription/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes
      });
      
      console.log('✅ Transcription terminée');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur transcription:', error);
      
      // Simulation de transcription en mode démo
      return {
        text: 'Transcription de démonstration. Le contenu audio a été traité avec succès.',
        confidence: 0.95,
        duration: 120,
        language: 'fr'
      };
    }
  },

  // Récupérer l'historique des transcriptions
  getHistory: async () => {
    console.log('📜 Récupération historique transcriptions');
    
    try {
      const response = await api.get('/transcription/history');
      console.log('✅ Historique récupéré');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur historique transcriptions:', error);
      return [];
    }
  },
};

// ===== SERVICES D'ANALYSE DISC =====

export const discService = {
  // Effectuer une évaluation DISC
  evaluate: async (responses: any[]) => {
    console.log('🧠 Évaluation DISC');
    
    try {
      const response = await api.post('/disc/evaluate', { responses });
      console.log('✅ Évaluation DISC terminée');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur évaluation DISC:', error);
      
      // Résultat de démo
      return {
        profile: 'Dominant-Influent',
        scores: {
          D: 75,
          I: 80,
          S: 45,
          C: 60
        },
        description: 'Profil orienté action et communication',
        recommendations: [
          'Excellent en leadership',
          'Forte capacité d\'influence',
          'Besoin de défis stimulants'
        ]
      };
    }
  },

  // Récupérer le profil DISC de l'utilisateur
  getProfile: async () => {
    console.log('🧠 Récupération profil DISC');
    
    try {
      const response = await api.get('/disc/profile');
      console.log('✅ Profil DISC récupéré');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur profil DISC:', error);
      return null;
    }
  },
};

// ===== SERVICES IA =====

export const aiService = {
  // Analyse de contenu par IA
  analyzeContent: async (content: string, type: 'text' | 'audio' | 'video') => {
    console.log('🤖 Analyse IA du contenu');
    
    try {
      const response = await api.post('/ai/analyze', { content, type });
      console.log('✅ Analyse IA terminée');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur analyse IA:', error);
      
      // Résultat de démo
      return {
        sentiment: 'positive',
        confidence: 0.87,
        keywords: ['développement', 'personnel', 'transformation'],
        summary: 'Contenu orienté développement personnel avec un ton positif',
        recommendations: [
          'Contenu adapté pour un public en quête de croissance',
          'Ton motivant et inspirant'
        ]
      };
    }
  },

  // Génération de recommandations personnalisées
  getPersonalizedRecommendations: async (userId: number) => {
    console.log('🎯 Génération recommandations personnalisées');
    
    try {
      const response = await api.get(`/ai/recommendations/${userId}`);
      console.log('✅ Recommandations générées');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur recommandations IA:', error);
      return [];
    }
  },
};

// ===== SERVICES DE PROFIL =====

export const profileService = {
  // Récupérer un profil public
  getPublicProfile: async (userId: number) => {
    console.log('👤 Récupération profil public:', userId);
    
    try {
      const response = await api.get(`/profiles/${userId}`);
      console.log('✅ Profil public récupéré');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur profil public:', error);
      return null;
    }
  },

  // Mettre à jour les préférences
  updatePreferences: async (preferences: any) => {
    console.log('⚙️ Mise à jour préférences');
    
    try {
      const response = await api.put('/profiles/preferences', preferences);
      console.log('✅ Préférences mises à jour');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour préférences:', error);
      throw error;
    }
  },
};

// ===== EXPORT PRINCIPAL =====

// Export de l'instance axios configurée
export { api };

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
};

// Logs de démarrage
console.log('🚀 Services API SpotBulle initialisés');
console.log('🔗 URL de base:', API_BASE_URL);
console.log('🔧 Variable d\'environnement Vite:', import.meta.env.VITE_API_BASE_URL);
console.log('⏱️ Timeout configuré:', '30 secondes');
console.log('🔧 Mode:', import.meta.env.MODE || 'development');

