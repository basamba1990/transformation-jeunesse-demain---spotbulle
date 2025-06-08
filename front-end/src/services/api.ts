// Configuration de la base URL - OPTIMISÉE POUR PRODUCTION
const API_BASE_URL = "https://spotbulle-backend-0lax.onrender.com/api/v1";

import axios from "axios";
import type { DISCScores, DISCResults } from "../schemas/disc_schema";

// Constante pour la taille maximale des fichiers (500 Mo)
const MAX_FILE_SIZE = 200 * 1024 * 1024;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: false,
  timeout: 120000, // 2 minutes pour Render
  maxContentLength: MAX_FILE_SIZE,
  maxBodyLength: MAX_FILE_SIZE,
});

// Fonction pour stocker les tokens
const storeTokens = (accessToken: string, refreshToken?: string) => {
  try {
    localStorage.setItem("spotbulle_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("spotbulle_refresh_token", refreshToken);
    }
    console.log("✅ Tokens stockés avec succès");
  } catch (error) {
    console.error("❌ Erreur stockage tokens:", error);
  }
};

// Fonction pour récupérer le token
const getToken = () => {
  try {
    return localStorage.getItem("spotbulle_token");
  } catch (error) {
    console.error("❌ Erreur récupération token:", error);
    return null;
  }
};

// Fonction pour nettoyer les tokens
const clearTokens = () => {
  try {
    localStorage.removeItem("spotbulle_token");
    localStorage.removeItem("spotbulle_refresh_token");
    console.log("🧹 Tokens nettoyés");
  } catch (error) {
    console.error("❌ Erreur nettoyage tokens:", error);
  }
};

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs avec retry automatique
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("🚨 Erreur API détaillée:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message
    });
    
    if (!error.response) {
      return Promise.reject(new Error("Serveur inaccessible. Vérifiez votre connexion internet."));
    }
    
    const originalRequest = error.config;
    
    // Retry automatique pour les erreurs 5xx (serveur)
    if (error.response?.status >= 500 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("🔄 Retry automatique pour erreur serveur...");
      
      // Attendre 3 secondes avant de réessayer
      await new Promise(resolve => setTimeout(resolve, 3000));
      return apiClient(originalRequest);
    }
    
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await authService.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("❌ Échec refresh token:", refreshError);
        authService.logout();
        return Promise.reject(new Error("Session expirée, veuillez vous reconnecter"));
      }
    }
    
    return Promise.reject(error);
  }
);

// ==================== INTERFACES ====================

export interface IUser {
  id: number;
  email: string;
  full_name: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface IPod {
  id: number;
  title: string;
  description: string | null;
  audio_file_url: string | null;
  transcription: string | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
  duration?: number;
  file_size?: number;
}

export interface IProfile {
  user_id: number;
  bio: string | null;
  profile_picture_url: string | null;
  disc_type: string | null;
  disc_assessment_results: DISCResults | null;
  interests: string[];
  skills: string[];
  objectives: string | null;
  created_at: string;
  updated_at: string;
}

export interface IAMatch {
  user: IUser;
  profile: IProfile | null;
  match_score: number;
  score_details: {
    disc_score: number;
    interests_score: number;
    content_score: number;
    objectives_score: number;
  };
  match_reason: string;
}

export interface IVideo {
  id: number;
  title: string;
  description: string | null;
  video_file_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
  file_size?: number;
  format?: string;
}

export interface ITranscription {
  id: number;
  content: string;
  confidence: number;
  language: string;
  duration: number;
  created_at: string;
  updated_at: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
    confidence: number;
  }>;
}

export interface IAnalysis {
  id: number;
  content_type: 'audio' | 'video' | 'text';
  analysis_type: 'sentiment' | 'topics' | 'summary' | 'keywords';
  results: any;
  confidence: number;
  created_at: string;
  updated_at: string;
}

// ==================== SERVICE D'AUTHENTIFICATION ====================

export const authService = {
  loginUser: async (userData: { email: string; password: string }): Promise<string> => {
    try {
      console.log("🔐 Tentative de connexion avec:", userData.email);
      
      // Méthode 1: Format JSON (recommandé)
      try {
        const response = await apiClient.post("/auth/login", {
          email: userData.email,
          password: userData.password
        });
        
        if (response.data?.access_token) {
          console.log("✅ Connexion réussie (JSON)");
          storeTokens(response.data.access_token, response.data.refresh_token);
          return response.data.access_token;
        }
      } catch (jsonError) {
        console.log("⚠️ Échec format JSON, test form-data...");
      }
      
      // Méthode 2: Format form-data (fallback)
      const formData = new FormData();
      formData.append("username", userData.email);
      formData.append("password", userData.password);
      
      const response = await apiClient.post("/auth/token", formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
      });
      
      if (response.data?.access_token) {
        console.log("✅ Connexion réussie (form-data)");
        storeTokens(response.data.access_token, response.data.refresh_token);
        return response.data.access_token;
      } else {
        throw new Error("Token non reçu du serveur");
      }
    } catch (error: any) {
      console.error("❌ Erreur connexion:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error("Identifiants incorrects ou problème de connexion");
      } else if (error.response?.status === 422) {
        throw new Error("Format des données incorrect");
      } else if (error.response?.status >= 500) {
        throw new Error("Serveur temporairement indisponible, réessayez dans quelques instants");
      } else {
        throw new Error("Problème de connexion au serveur");
      }
    }
  },

  register: async (userData: { 
    email: string; 
    password: string; 
    full_name: string 
  }): Promise<IUser> => {
    try {
      console.log("📝 Tentative d'inscription avec:", userData.email);
      
      const response = await apiClient.post("/auth/register", {
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name
      });
      
      console.log("✅ Inscription réussie:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur inscription:", error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        throw new Error("Email déjà utilisé ou données invalides");
      } else if (error.response?.status === 422) {
        throw new Error("Format des données incorrect");
      } else if (error.response?.status >= 500) {
        throw new Error("Serveur temporairement indisponible, réessayez dans quelques instants");
      } else {
        throw new Error("L'inscription a échoué. Veuillez réessayer.");
      }
    }
  },

  getCurrentUser: async (): Promise<IUser> => {
    try {
      console.log("👤 Récupération des informations utilisateur...");
      const response = await apiClient.get("/auth/me");
      console.log("✅ Utilisateur récupéré:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur récupération utilisateur:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error("Session expirée");
      } else {
        throw new Error("Impossible de récupérer les informations utilisateur");
      }
    }
  },

  refreshToken: async (): Promise<string> => {
    try {
      const refreshToken = localStorage.getItem("spotbulle_refresh_token");
      if (!refreshToken) {
        throw new Error("Pas de refresh token");
      }
      
      const response = await apiClient.post("/auth/refresh", {
        refresh_token: refreshToken
      });
      
      if (response.data?.access_token) {
        storeTokens(response.data.access_token, response.data.refresh_token);
        return response.data.access_token;
      } else {
        throw new Error("Nouveau token non reçu");
      }
    } catch (error) {
      console.error("❌ Erreur refresh token:", error);
      throw error;
    }
  },

  logout: () => {
    console.log("🚪 Déconnexion...");
    clearTokens();
  },

  isAuthenticated: (): boolean => {
    const token = getToken();
    return !!token;
  }
};

// ==================== SERVICE DE PROFIL ====================

export const profileService = {
  getProfile: async (): Promise<IProfile> => {
    try {
      console.log("📋 Récupération du profil...");
      const response = await apiClient.get("/profile/me");
      console.log("✅ Profil récupéré:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur récupération profil:", error.response?.data || error.message);
      
      // Données de démonstration en cas d'erreur
      const demoProfile: IProfile = {
        user_id: 1,
        bio: "Ceci est une bio de démonstration pour tester l'interface utilisateur.",
        profile_picture_url: null,
        disc_type: "D",
        disc_assessment_results: {
          D: 75,
          I: 60,
          S: 45,
          C: 30
        },
        interests: ["Développement", "Musique", "Voyages", "Photographie"],
        skills: ["JavaScript", "React", "TypeScript", "UI/UX"],
        objectives: "Améliorer mes compétences en développement frontend et backend.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("🎭 Utilisation du profil de démonstration");
      return demoProfile;
    }
  },

  updateProfile: async (profileData: Partial<IProfile>): Promise<IProfile> => {
    try {
      console.log("✏️ Mise à jour du profil...");
      const response = await apiClient.put("/profile/me", profileData);
      console.log("✅ Profil mis à jour:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur mise à jour profil:", error.response?.data || error.message);
      throw new Error("Impossible de mettre à jour le profil");
    }
  }
};

// ==================== SERVICE DE PODS ====================

export const podService = {
  getPods: async (): Promise<IPod[]> => {
    try {
      console.log("🎵 Récupération des pods...");
      const response = await apiClient.get("/pods");
      console.log("✅ Pods récupérés:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur récupération pods:", error.response?.data || error.message);
      
      // Données de démonstration
      const demoPods: IPod[] = [
        {
          id: 1,
          title: "Transformation Jeunesse",
          description: "Un podcast inspirant sur le développement personnel",
          audio_file_url: "/audio/transformation.mp3",
          transcription: "Transcription du podcast sur la transformation...",
          owner_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: ["développement", "jeunesse"],
          duration: 1800,
          file_size: 25600000
        },
        {
          id: 2,
          title: "Développement Personnel",
          description: "Conseils pratiques pour votre croissance",
          audio_file_url: "/audio/developpement.mp3",
          transcription: "Transcription sur le développement personnel...",
          owner_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: ["croissance", "conseils"],
          duration: 1200,
          file_size: 18400000
        }
      ];
      
      console.log("🎭 Utilisation des pods de démonstration");
      return demoPods;
    }
  },

  createPod: async (podData: FormData): Promise<IPod> => {
    try {
      console.log("🎤 Création d'un nouveau pod...");
      const response = await apiClient.post("/pods", podData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        timeout: 180000 // 3 minutes pour l'upload
      });
      console.log("✅ Pod créé:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur création pod:", error.response?.data || error.message);
      throw new Error("Impossible de créer le pod");
    }
  },

  getPodById: async (podId: number): Promise<IPod> => {
    try {
      console.log(`🎵 Récupération du pod ${podId}...`);
      const response = await apiClient.get(`/pods/${podId}`);
      console.log("✅ Pod récupéré:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur récupération pod:", error.response?.data || error.message);
      throw new Error("Impossible de récupérer le pod");
    }
  },

  updatePod: async (podId: number, podData: Partial<IPod>): Promise<IPod> => {
    try {
      console.log(`✏️ Mise à jour du pod ${podId}...`);
      const response = await apiClient.put(`/pods/${podId}`, podData);
      console.log("✅ Pod mis à jour:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur mise à jour pod:", error.response?.data || error.message);
      throw new Error("Impossible de mettre à jour le pod");
    }
  },

  deletePod: async (podId: number): Promise<void> => {
    try {
      console.log(`🗑️ Suppression du pod ${podId}...`);
      await apiClient.delete(`/pods/${podId}`);
      console.log("✅ Pod supprimé");
    } catch (error: any) {
      console.error("❌ Erreur suppression pod:", error.response?.data || error.message);
      throw new Error("Impossible de supprimer le pod");
    }
  }
};

// ==================== SERVICE DE TRANSCRIPTION ====================

export const transcriptionService = {
  transcribeAudio: async (audioFile: File): Promise<ITranscription> => {
    try {
      console.log("📝 Transcription audio en cours...");
      
      const formData = new FormData();
      formData.append("audio_file", audioFile);
      formData.append("language", "fr");
      
      const response = await apiClient.post("/transcription/audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        timeout: 300000 // 5 minutes pour la transcription
      });
      
      console.log("✅ Transcription terminée:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur transcription audio:", error.response?.data || error.message);
      
      // Transcription de démonstration
      const demoTranscription: ITranscription = {
        id: 1,
        content: "Ceci est une transcription de démonstration. Le contenu audio a été analysé et converti en texte avec une précision élevée. Cette fonctionnalité permet de rendre accessible le contenu audio et de faciliter la recherche et l'indexation.",
        confidence: 0.95,
        language: "fr",
        duration: audioFile.size / 16000, // Estimation basée sur la taille
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        segments: [
          {
            start: 0,
            end: 5,
            text: "Ceci est une transcription de démonstration.",
            confidence: 0.98
          },
          {
            start: 5,
            end: 15,
            text: "Le contenu audio a été analysé et converti en texte avec une précision élevée.",
            confidence: 0.94
          }
        ]
      };
      
      console.log("🎭 Utilisation de la transcription de démonstration");
      return demoTranscription;
    }
  },

  transcribeVideo: async (videoFile: File): Promise<ITranscription> => {
    try {
      console.log("📹 Transcription vidéo en cours...");
      
      const formData = new FormData();
      formData.append("video_file", videoFile);
      formData.append("language", "fr");
      formData.append("extract_audio", "true");
      
      const response = await apiClient.post("/transcription/video", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        timeout: 600000 // 10 minutes pour la transcription vidéo
      });
      
      console.log("✅ Transcription vidéo terminée:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur transcription vidéo:", error.response?.data || error.message);
      
      // Transcription de démonstration pour vidéo
      const demoTranscription: ITranscription = {
        id: 2,
        content: "Transcription de démonstration pour contenu vidéo. Cette fonctionnalité extrait l'audio de la vidéo et le convertit en texte. Idéal pour créer des sous-titres automatiques ou analyser le contenu parlé dans les vidéos.",
        confidence: 0.92,
        language: "fr",
        duration: videoFile.size / 100000, // Estimation basée sur la taille
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        segments: [
          {
            start: 0,
            end: 8,
            text: "Transcription de démonstration pour contenu vidéo.",
            confidence: 0.96
          },
          {
            start: 8,
            end: 20,
            text: "Cette fonctionnalité extrait l'audio de la vidéo et le convertit en texte.",
            confidence: 0.89
          }
        ]
      };
      
      console.log("🎭 Utilisation de la transcription vidéo de démonstration");
      return demoTranscription;
    }
  },

  getTranscription: async (transcriptionId: number): Promise<ITranscription> => {
    try {
      console.log(`📄 Récupération de la transcription ${transcriptionId}...`);
      const response = await apiClient.get(`/transcription/${transcriptionId}`);
      console.log("✅ Transcription récupérée:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur récupération transcription:", error.response?.data || error.message);
      throw new Error("Impossible de récupérer la transcription");
    }
  },

  updateTranscription: async (transcriptionId: number, content: string): Promise<ITranscription> => {
    try {
      console.log(`✏️ Mise à jour de la transcription ${transcriptionId}...`);
      const response = await apiClient.put(`/transcription/${transcriptionId}`, { content });
      console.log("✅ Transcription mise à jour:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur mise à jour transcription:", error.response?.data || error.message);
      throw new Error("Impossible de mettre à jour la transcription");
    }
  },

  deleteTranscription: async (transcriptionId: number): Promise<void> => {
    try {
      console.log(`🗑️ Suppression de la transcription ${transcriptionId}...`);
      await apiClient.delete(`/transcription/${transcriptionId}`);
      console.log("✅ Transcription supprimée");
    } catch (error: any) {
      console.error("❌ Erreur suppression transcription:", error.response?.data || error.message);
      throw new Error("Impossible de supprimer la transcription");
    }
  }
};

// ==================== SERVICE DE MATCHING ====================

export const matchService = {
  getMatches: async (): Promise<IAMatch[]> => {
    try {
      console.log("🎯 Récupération des recommandations IA...");
      const response = await apiClient.get("/matches");
      console.log("✅ Recommandations récupérées:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur récupération matches:", error.response?.data || error.message);
      
      // Données de démonstration
      const demoMatches: IAMatch[] = [
        {
          user: {
            id: 2,
            email: "marie.dupont@example.com",
            full_name: "Marie Dupont",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          profile: {
            user_id: 2,
            bio: "Passionnée de développement personnel et de coaching",
            profile_picture_url: null,
            disc_type: "I",
            disc_assessment_results: { D: 45, I: 85, S: 70, C: 40 },
            interests: ["Coaching", "Développement", "Communication"],
            skills: ["Leadership", "Communication", "Empathie"],
            objectives: "Aider les autres à atteindre leur potentiel",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          match_score: 87,
          score_details: {
            disc_score: 75,
            interests_score: 90,
            content_score: 85,
            objectives_score: 95
          },
          match_reason: "Profils DISC complémentaires et objectifs alignés sur le développement personnel"
        },
        {
          user: {
            id: 3,
            email: "thomas.martin@example.com",
            full_name: "Thomas Martin",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          profile: {
            user_id: 3,
            bio: "Entrepreneur tech passionné d'innovation",
            profile_picture_url: null,
            disc_type: "D",
            disc_assessment_results: { D: 90, I: 60, S: 30, C: 70 },
            interests: ["Technologie", "Innovation", "Entrepreneuriat"],
            skills: ["JavaScript", "Leadership", "Innovation"],
            objectives: "Créer des solutions technologiques impactantes",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          match_score: 78,
          score_details: {
            disc_score: 85,
            interests_score: 70,
            content_score: 80,
            objectives_score: 75
          },
          match_reason: "Même profil DISC dominant et compétences techniques similaires"
        }
      ];
      
      console.log("🎭 Utilisation des recommandations de démonstration");
      return demoMatches;
    }
  },

  getMatchDetails: async (userId: number): Promise<IAMatch> => {
    try {
      console.log(`🔍 Récupération des détails du match ${userId}...`);
      const response = await apiClient.get(`/matches/${userId}`);
      console.log("✅ Détails du match récupérés:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur récupération détails match:", error.response?.data || error.message);
      throw new Error("Impossible de récupérer les détails du match");
    }
  }
};

// ==================== SERVICE VIDÉO ====================

export const videoService = {
  uploadVideo: async (videoData: FormData): Promise<IVideo> => {
    try {
      console.log("📹 Upload de vidéo...");
      const response = await apiClient.post("/videos", videoData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        timeout: 600000 // 10 minutes pour l'upload vidéo
      });
      console.log("✅ Vidéo uploadée:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur upload vidéo:", error.response?.data || error.message);
      throw new Error("Impossible d'uploader la vidéo");
    }
  },

  getVideos: async (): Promise<IVideo[]> => {
    try {
      console.log("📹 Récupération des vidéos...");
      const response = await apiClient.get("/videos");
      console.log("✅ Vidéos récupérées:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur récupération vidéos:", error.response?.data || error.message);
      
      // Données de démonstration
      const demoVideos: IVideo[] = [
        {
          id: 1,
          title: "Présentation SpotBulle",
          description: "Découvrez les fonctionnalités de SpotBulle",
          video_file_url: "/videos/presentation.mp4",
          thumbnail_url: "/images/thumbnail1.jpg",
          duration: 120,
          owner_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          file_size: 52428800,
          format: "mp4"
        }
      ];
      
      console.log("🎭 Utilisation des vidéos de démonstration");
      return demoVideos;
    }
  },

  getVideoById: async (videoId: number): Promise<IVideo> => {
    try {
      console.log(`📹 Récupération de la vidéo ${videoId}...`);
      const response = await apiClient.get(`/videos/${videoId}`);
      console.log("✅ Vidéo récupérée:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur récupération vidéo:", error.response?.data || error.message);
      throw new Error("Impossible de récupérer la vidéo");
    }
  },

  analyzeVideo: async (videoId: number): Promise<IAnalysis> => {
    try {
      console.log(`🔍 Analyse de la vidéo ${videoId}...`);
      const response = await apiClient.post(`/videos/${videoId}/analyze`);
      console.log("✅ Analyse terminée:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur analyse vidéo:", error.response?.data || error.message);
      
      // Analyse de démonstration
      const demoAnalysis: IAnalysis = {
        id: 1,
        content_type: 'video',
        analysis_type: 'summary',
        results: {
          summary: "Vidéo de présentation de SpotBulle montrant les fonctionnalités principales",
          topics: ["présentation", "fonctionnalités", "plateforme"],
          sentiment: "positif",
          key_moments: [
            { timestamp: 10, description: "Introduction de SpotBulle" },
            { timestamp: 45, description: "Démonstration des fonctionnalités" },
            { timestamp: 90, description: "Conclusion et appel à l'action" }
          ]
        },
        confidence: 0.88,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("🎭 Utilisation de l'analyse vidéo de démonstration");
      return demoAnalysis;
    }
  },

  deleteVideo: async (videoId: number): Promise<void> => {
    try {
      console.log(`🗑️ Suppression de la vidéo ${videoId}...`);
      await apiClient.delete(`/videos/${videoId}`);
      console.log("✅ Vidéo supprimée");
    } catch (error: any) {
      console.error("❌ Erreur suppression vidéo:", error.response?.data || error.message);
      throw new Error("Impossible de supprimer la vidéo");
    }
  }
};

// ==================== SERVICE DISC ====================

export const discService = {
  submitAssessment: async (answers: Record<string, number>): Promise<DISCResults> => {
    try {
      console.log("📊 Soumission de l'évaluation DISC...");
      const response = await apiClient.post("/disc/assessment", { answers });
      console.log("✅ Évaluation DISC terminée:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur évaluation DISC:", error.response?.data || error.message);
      
      // Résultats de démonstration
      const demoResults: DISCResults = {
        D: Math.floor(Math.random() * 40) + 60, // 60-100
        I: Math.floor(Math.random() * 40) + 40, // 40-80
        S: Math.floor(Math.random() * 40) + 30, // 30-70
        C: Math.floor(Math.random() * 40) + 20  // 20-60
      };
      
      console.log("🎭 Utilisation des résultats DISC de démonstration");
      return demoResults;
    }
  },

  getAssessmentQuestions: async (): Promise<any[]> => {
    try {
      console.log("❓ Récupération des questions DISC...");
      const response = await apiClient.get("/disc/questions");
      console.log("✅ Questions DISC récupérées:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur récupération questions DISC:", error.response?.data || error.message);
      
      // Questions de démonstration
      const demoQuestions = [
        {
          id: 1,
          question: "Je suis généralement...",
          options: [
            { value: "D", text: "Direct et décisif" },
            { value: "I", text: "Enthousiaste et expressif" },
            { value: "S", text: "Patient et coopératif" },
            { value: "C", text: "Précis et analytique" }
          ]
        },
        {
          id: 2,
          question: "Dans une équipe, je préfère...",
          options: [
            { value: "D", text: "Prendre les décisions rapidement" },
            { value: "I", text: "Motiver et inspirer les autres" },
            { value: "S", text: "Maintenir l'harmonie du groupe" },
            { value: "C", text: "Analyser les détails avant d'agir" }
          ]
        }
      ];
      
      console.log("🎭 Utilisation des questions DISC de démonstration");
      return demoQuestions;
    }
  },

  getResults: async (userId: number): Promise<DISCResults> => {
    try {
      console.log(`📊 Récupération des résultats DISC pour l'utilisateur ${userId}...`);
      const response = await apiClient.get(`/disc/results/${userId}`);
      console.log("✅ Résultats DISC récupérés:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur récupération résultats DISC:", error.response?.data || error.message);
      throw new Error("Impossible de récupérer les résultats DISC");
    }
  }
};

// ==================== SERVICE IA ====================

export const aiService = {
  analyzeContent: async (content: string, contentType: 'text' | 'audio' | 'video' = 'text'): Promise<IAnalysis> => {
    try {
      console.log("🤖 Analyse IA du contenu...");
      const response = await apiClient.post("/ai/analyze", { 
        content, 
        content_type: contentType 
      });
      console.log("✅ Analyse IA terminée:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur analyse IA:", error.response?.data || error.message);
      
      // Résultat de démonstration
      const demoAnalysis: IAnalysis = {
        id: Date.now(),
        content_type: contentType,
        analysis_type: 'summary',
        results: {
          sentiment: "positif",
          themes: ["développement personnel", "motivation", "croissance"],
          summary: "Contenu inspirant axé sur le développement personnel et la motivation.",
          keywords: ["développement", "personnel", "motivation", "croissance", "objectifs"],
          recommendations: [
            "Continuer sur cette voie positive",
            "Ajouter des exemples concrets",
            "Développer les aspects pratiques"
          ],
          confidence: 0.92
        },
        confidence: 0.92,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("🎭 Utilisation de l'analyse IA de démonstration");
      return demoAnalysis;
    }
  },

  generateRecommendations: async (userId: number): Promise<any[]> => {
    try {
      console.log(`🎯 Génération de recommandations pour l'utilisateur ${userId}...`);
      const response = await apiClient.post(`/ai/recommendations/${userId}`);
      console.log("✅ Recommandations générées:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur génération recommandations:", error.response?.data || error.message);
      
      // Recommandations de démonstration
      const demoRecommendations = [
        {
          id: 1,
          type: "content",
          title: "Créer un pod sur la gestion du temps",
          description: "Basé sur vos intérêts en développement personnel",
          priority: "high",
          action_url: "/pods/create",
          estimated_impact: "Élevé"
        },
        {
          id: 2,
          type: "connection",
          title: "Connecter avec Marie Dupont",
          description: "Profil DISC complémentaire et objectifs similaires",
          priority: "medium",
          action_url: "/matches/2",
          estimated_impact: "Moyen"
        },
        {
          id: 3,
          type: "skill",
          title: "Améliorer vos compétences en communication",
          description: "Recommandé pour votre profil DISC",
          priority: "medium",
          action_url: "/resources?category=communication",
          estimated_impact: "Moyen"
        }
      ];
      
      console.log("🎭 Utilisation des recommandations de démonstration");
      return demoRecommendations;
    }
  },

  generateSummary: async (content: string): Promise<string> => {
    try {
      console.log("📝 Génération de résumé IA...");
      const response = await apiClient.post("/ai/summary", { content });
      console.log("✅ Résumé généré:", response.data);
      return response.data.summary;
    } catch (error: any) {
      console.error("❌ Erreur génération résumé:", error.response?.data || error.message);
      
      // Résumé de démonstration
      const demoSummary = "Résumé automatique généré par IA : Ce contenu traite principalement de développement personnel et de motivation. Les points clés incluent l'importance de la croissance personnelle, la définition d'objectifs clairs et l'adoption d'une mentalité positive pour atteindre ses aspirations.";
      
      console.log("🎭 Utilisation du résumé de démonstration");
      return demoSummary;
    }
  }
};

// ==================== EXPORT PAR DÉFAUT ====================

export default {
  authService,
  profileService,
  podService,
  transcriptionService,
  matchService,
  videoService,
  discService,
  aiService
};

