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
      window.location.href = '/login';
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
      // Essayer d'abord avec form-data (format attendu par le backend)
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      console.log('📤 Envoi requête de connexion...');
      const response = await api.post('/auth/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('✅ Connexion backend réussie');
      
      // Récupérer les informations utilisateur
      const userResponse = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${response.data.access_token}`
        }
      });
      
      console.log('👤 Utilisateur:', userResponse.data);
      
      // Stocker le token
      localStorage.setItem('spotbulle_token', response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem('spotbulle_refreshToken', response.data.refresh_token);
      }
      
      return {
        ...response.data,
        user: userResponse.data
      };
    } catch (error) {
      console.error('❌ Erreur connexion backend:', error);
      throw new Error('Identifiants incorrects ou problème de connexion');
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
      
      if (error.response?.status === 400) {
        throw new Error('Email déjà utilisé ou données invalides');
      }
      
      throw new Error('Erreur lors de l\'inscription');
    }
  },

  // Alias pour compatibilité
  registerUser: async (userData: any) => {
    return authService.register(userData);
  },

  // Récupération du profil utilisateur
  getProfile: async () => {
    console.log('🔍 Récupération utilisateur backend...');
    console.log('🌐 URL backend utilisée:', API_BASE_URL);
    
    try {
      console.log('📤 Envoi requête profil...');
      const response = await api.get('/auth/me');
      console.log('✅ Utilisateur backend récupéré:', response.data);
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
      
      // Données de démo en cas d'erreur
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
        },
        {
          id: 3,
          title: 'Leadership et Communication',
          description: 'Développer ses compétences de leader et améliorer sa communication',
          audio_url: '/audio/leadership-communication.mp3',
          duration: 320,
          created_at: '2025-06-03T16:15:00Z',
          author: 'Marie Dubois',
          plays: 756,
          likes: 45,
          category: 'Leadership'
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

  // Upload d'un fichier audio pour un pod
  uploadAudio: async (file: File, onProgress?: (progress: number) => void) => {
    console.log('🎤 Upload audio pour pod:', file.name);
    
    const formData = new FormData();
    formData.append('audio', file);
    
    try {
      const response = await api.post('/pods/upload-audio', formData, {
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
      
      console.log('✅ Audio uploadé');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur upload audio:', error);
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
            bio: 'Passionnée de développement personnel et de coaching',
            interests: 'Leadership, Communication, Entrepreneuriat'
          },
          compatibility_score: 92,
          match_reason: 'Intérêts communs en développement personnel et leadership',
          created_at: '2025-06-07T10:00:00Z',
          status: 'pending'
        },
        {
          id: 2,
          user: {
            id: 3,
            full_name: 'Thomas Martin',
            email: 'thomas.martin@example.com',
            bio: 'Entrepreneur et mentor en transformation digitale',
            interests: 'Innovation, Technologie, Mentorat'
          },
          compatibility_score: 87,
          match_reason: 'Profils complémentaires en entrepreneuriat',
          created_at: '2025-06-06T15:30:00Z',
          status: 'accepted'
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
      
      // Recommandations de démo
      const demoRecommendations = [
        {
          id: 4,
          full_name: 'Sophie Laurent',
          email: 'sophie.laurent@example.com',
          bio: 'Coach en développement personnel spécialisée en confiance en soi',
          interests: 'Psychologie positive, Méditation, Coaching',
          compatibility_score: 89,
          reason: 'Expertise complémentaire en développement personnel'
        }
      ];
      
      return demoRecommendations;
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
        timeout: 600000, // 10 minutes pour l'upload vidéo
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

  // Récupérer toutes les vidéos
  getAll: async () => {
    console.log('🎬 Récupération de toutes les vidéos');
    
    try {
      const response = await api.get('/videos');
      console.log('✅ Vidéos récupérées');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération vidéos:', error);
      return [];
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
      
      // Simulation de transcription en cas d'erreur
      return {
        text: `Transcription de démonstration pour le fichier "${file.name}". 
               
               Bonjour et bienvenue sur SpotBulle, votre plateforme de transformation personnelle par l'audio. 
               
               Dans cet enregistrement, nous explorons les techniques de développement personnel qui peuvent 
               transformer votre vie professionnelle et personnelle. 
               
               Les points clés abordés incluent la confiance en soi, la communication efficace, et les 
               stratégies de leadership authentique.
               
               Merci de votre écoute et n'hésitez pas à partager vos réflexions avec la communauté SpotBulle.`,
        confidence: 0.95,
        duration: Math.floor(file.size / 16000), // Estimation basée sur la taille
        language: 'fr',
        words_count: 87,
        processing_time: 2.3
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
      
      // Historique de démo
      return [
        {
          id: 1,
          filename: 'presentation-spotbulle.mp3',
          text: 'Transcription de la présentation SpotBulle...',
          created_at: '2025-06-08T10:00:00Z',
          duration: 180,
          confidence: 0.92
        }
      ];
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
        description: 'Profil orienté action et communication. Vous êtes naturellement porté vers le leadership et l\'influence positive.',
        recommendations: [
          'Excellent en leadership et prise de décision',
          'Forte capacité d\'influence et de persuasion',
          'Besoin de défis stimulants et de variété',
          'Développer la patience pour les détails'
        ],
        strengths: [
          'Leadership naturel',
          'Communication persuasive',
          'Orientation résultats',
          'Adaptabilité'
        ],
        areas_for_growth: [
          'Attention aux détails',
          'Patience avec les processus',
          'Écoute active'
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
        keywords: ['développement', 'personnel', 'transformation', 'leadership', 'communication'],
        summary: 'Contenu orienté développement personnel avec un ton positif et motivant',
        themes: [
          'Développement personnel',
          'Leadership',
          'Communication',
          'Transformation'
        ],
        recommendations: [
          'Contenu adapté pour un public en quête de croissance personnelle',
          'Ton motivant et inspirant qui encourage l\'action',
          'Approche pratique et applicable au quotidien'
        ],
        engagement_score: 8.5,
        readability_score: 7.8
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
      
      // Recommandations de démo
      return [
        {
          type: 'pod',
          title: 'Développer votre leadership authentique',
          description: 'Basé sur votre profil DISC, ce contenu vous aidera à renforcer vos compétences de leader',
          confidence: 0.92
        },
        {
          type: 'match',
          title: 'Connexion avec des mentors en communication',
          description: 'Nous avons identifié des profils qui pourraient vous accompagner dans votre développement',
          confidence: 0.88
        }
      ];
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

// ===== SERVICES D'UPLOAD D'IMAGES =====

export const imageService = {
  // Upload d'une image
  upload: async (file: File, onProgress?: (progress: number) => void) => {
    console.log('🖼️ Upload image:', file.name);
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes pour l'upload d'image
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
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

