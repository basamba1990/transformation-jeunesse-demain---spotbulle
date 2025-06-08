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

  // ✅ FONCTION REGISTER CORRIGÉE
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

  // ✅ ALIAS POUR COMPATIBILITÉ AVEC AUTHCONTEXT EXISTANT
  registerUser: async (userData: { 
    email: string; 
    password: string; 
    fullName: string 
  }): Promise<IUser> => {
    return authService.register({
      email: userData.email,
      password: userData.password,
      full_name: userData.fullName
    });
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

// ==================== AUTRES SERVICES ====================
// (Tous les autres services restent identiques...)

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
        }
      ];
      
      console.log("🎭 Utilisation des pods de démonstration");
      return demoPods;
    }
  }
};

export const matchService = {
  getMatches: async (): Promise<IAMatch[]> => {
    try {
      console.log("🎯 Récupération des recommandations IA...");
      const response = await apiClient.get("/matches");
      console.log("✅ Recommandations récupérées:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur récupération matches:", error.response?.data || error.message);
      return [];
    }
  }
};

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
  }
};

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
      throw new Error("Impossible de transcrire l'audio");
    }
  }
};

export const discService = {
  submitAssessment: async (answers: Record<string, number>): Promise<DISCResults> => {
    try {
      console.log("📊 Soumission de l'évaluation DISC...");
      const response = await apiClient.post("/disc/assessment", { answers });
      console.log("✅ Évaluation DISC terminée:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur évaluation DISC:", error.response?.data || error.message);
      throw new Error("Impossible de soumettre l'évaluation DISC");
    }
  }
};

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
      throw new Error("Impossible d'analyser le contenu");
    }
  }
};

// ==================== EXPORT PAR DÉFAUT ====================

export default {
  authService,
  profileService,
  podService,
  matchService,
  videoService,
  transcriptionService,
  discService,
  aiService
};

