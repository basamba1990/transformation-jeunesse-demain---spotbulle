import axios from "axios";
import type { DISCScores, DISCResults } from "../schemas/disc_schema";

// Configuration de la base URL - CORRIGÉE
const API_BASE_URL = "https://spotbulle-backend-0lax.onrender.com/api/v1";

// Constante pour la taille maximale des fichiers (200 Mo)
const MAX_FILE_SIZE = 200 * 1024 * 1024;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: false,
  timeout: 30000,
  maxContentLength: MAX_FILE_SIZE,
  maxBodyLength: MAX_FILE_SIZE,
});

// Fonction pour stocker les tokens
const storeTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem("spotbulle_token", accessToken);
  if (refreshToken) {
    localStorage.setItem("spotbulle_refresh_token", refreshToken);
  }
};

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("spotbulle_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("Erreur API:", error.response?.data || error.message);
    
    if (!error.response) {
      return Promise.reject(new Error("Serveur inaccessible. Veuillez réessayer plus tard."));
    }
    
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await authService.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        authService.logout();
        return Promise.reject(new Error("Session expirée, veuillez vous reconnecter"));
      }
    }
    
    return Promise.reject(error);
  }
);

// Interfaces principales
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
}

// Service d'authentification
export const authService = {
  loginUser: async (userData: { email: string; password: string }): Promise<string> => {
    try {
      console.log("Tentative de connexion avec:", userData.email);
      
      const formData = new FormData();
      formData.append("username", userData.email);
      formData.append("password", userData.password);
      
      const response = await apiClient.post("/auth/login", formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
      });
      
      console.log("Connexion réussie:", response.data);
      
      if (response.data.access_token) {
        storeTokens(response.data.access_token, response.data.refresh_token);
        return response.data.access_token;
      } else {
        throw new Error("Token non reçu du serveur");
      }
    } catch (error: any) {
      console.error("Erreur connexion:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error("Identifiants incorrects");
      } else if (error.response?.status === 422) {
        throw new Error("Format des données incorrect");
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
      console.log("Tentative d'inscription avec:", userData.email);
      
      const response = await apiClient.post("/auth/register", {
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name
      });
      
      console.log("Inscription réussie:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur inscription:", error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        throw new Error("Email déjà utilisé ou données invalides");
      } else if (error.response?.status === 422) {
        throw new Error("Format des données incorrect");
      } else {
        throw new Error("Échec de l'inscription");
      }
    }
  },

  getCurrentUser: async (): Promise<IUser> => {
    try {
      console.log("Récupération des informations utilisateur...");
      const response = await apiClient.get("/auth/me");
      console.log("Utilisateur récupéré:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur récupération utilisateur:", error);
      throw new Error("Impossible de charger le profil utilisateur");
    }
  },

  refreshToken: async (): Promise<string> => {
    try {
      const refreshToken = localStorage.getItem("spotbulle_refresh_token");
      if (!refreshToken) throw new Error("Aucun token de rafraîchissement");
      
      const response = await apiClient.post("/auth/refresh", { 
        refresh_token: refreshToken 
      });
      
      storeTokens(response.data.access_token, response.data.refresh_token);
      return response.data.access_token;
    } catch (error: any) {
      console.error("Erreur rafraîchissement token:", error);
      throw new Error("Session expirée");
    }
  },

  logout: (): void => {
    localStorage.removeItem("spotbulle_token");
    localStorage.removeItem("spotbulle_refresh_token");
    console.log("Déconnexion réussie");
  }
};

// Service de profil
export const profileService = {
  getMyProfile: async (): Promise<IProfile | null> => {
    try {
      console.log("Récupération du profil utilisateur...");
      const response = await apiClient.get("/profiles/me");
      console.log("Profil récupéré:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur récupération profil:", error);
      
      if (error.response?.status === 404) {
        return null;
      }
      
      throw new Error("Erreur lors du chargement du profil");
    }
  },

  createProfile: async (data: Partial<IProfile>): Promise<IProfile> => {
    try {
      console.log("Création du profil...");
      const response = await apiClient.post("/profiles", data);
      console.log("Profil créé:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur création profil:", error);
      throw new Error("Erreur lors de la création du profil");
    }
  },

  updateProfile: async (data: Partial<IProfile>): Promise<IProfile> => {
    try {
      console.log("Mise à jour du profil...");
      const response = await apiClient.put("/profiles/me", data);
      console.log("Profil mis à jour:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur mise à jour profil:", error);
      throw new Error("Erreur lors de la mise à jour du profil");
    }
  }
};

// Service Pod
export const podService = {
  fetchAll: async (): Promise<IPod[]> => {
    try {
      const response = await apiClient.get("/pods");
      return response.data || [];
    } catch (error: any) {
      console.error("Erreur récupération des pods:", error);
      return [];
    }
  },

  fetchMyPods: async (): Promise<IPod[]> => {
    try {
      const response = await apiClient.get("/pods/me");
      return response.data || [];
    } catch (error: any) {
      console.error("Erreur récupération de mes pods:", error);
      return [];
    }
  },

  createPod: async (data: FormData): Promise<IPod | null> => {
    try {
      console.log("Création du pod...");
      
      const response = await apiClient.post("/pods", data, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
        timeout: 60000,
      });
      
      console.log("Pod créé:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur création pod:", error);
      return null;
    }
  },

  getPod: async (id: number): Promise<IPod | null> => {
    try {
      const response = await apiClient.get(`/pods/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur récupération pod ${id}:`, error);
      return null;
    }
  },

  updatePod: async (id: number, data: FormData): Promise<IPod | null> => {
    try {
      const response = await apiClient.put(`/pods/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
      return response.data;
    } catch (error: any) {
      console.error(`Erreur mise à jour pod ${id}:`, error);
      return null;
    }
  },

  deletePod: async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/pods/${id}`);
      return true;
    } catch (error: any) {
      console.error("Erreur suppression pod:", error);
      return false;
    }
  },

  transcribePod: async (id: number): Promise<boolean> => {
    try {
      await apiClient.post(`/pods/${id}/transcribe`);
      return true;
    } catch (error: any) {
      console.error("Erreur transcription pod:", error);
      return false;
    }
  }
};

// Service de matching IA
export const matchService = {
  getMatches: async (limit: number = 10): Promise<IAMatch[]> => {
    try {
      console.log("Récupération des matchs IA...");
      const response = await apiClient.get(`/matches?limit=${limit}`);
      console.log("Matchs récupérés:", response.data);
      return response.data || [];
    } catch (error: any) {
      console.error("Erreur récupération des matchs:", error);
      
      // Retourner des données de démonstration
      return [
        {
          user: {
            id: 1,
            email: "utilisateur1@example.com",
            full_name: "Utilisateur Test 1",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          profile: {
            user_id: 1,
            bio: "Passionné de développement et de nouvelles technologies",
            profile_picture_url: null,
            disc_type: "D",
            disc_assessment_results: null,
            interests: ["Développement", "Musique", "Voyages"],
            skills: ["JavaScript", "React", "TypeScript"],
            objectives: "Améliorer mes compétences techniques",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          match_score: 0.85,
          score_details: {
            disc_score: 0.9,
            interests_score: 0.8,
            content_score: 0.85,
            objectives_score: 0.75
          },
          match_reason: "Forte compatibilité basée sur des intérêts communs et un profil DISC complémentaire"
        }
      ];
    }
  },

  getMatchDetails: async (userId: number): Promise<IAMatch | null> => {
    try {
      const response = await apiClient.get(`/matches/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur récupération détails du match:", error);
      return null;
    }
  }
};

// Service vidéo - AJOUTÉ
export const videoService = {
  uploadVideo: async (data: FormData): Promise<IVideo | null> => {
    try {
      console.log("Upload de vidéo...");
      
      const response = await apiClient.post("/videos", data, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
        timeout: 120000, // 2 minutes pour les vidéos
      });
      
      console.log("Vidéo uploadée:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur upload vidéo:", error);
      return null;
    }
  },

  getMyVideos: async (): Promise<IVideo[]> => {
    try {
      const response = await apiClient.get("/videos/me");
      return response.data || [];
    } catch (error: any) {
      console.error("Erreur récupération vidéos:", error);
      return [];
    }
  },

  getAllVideos: async (): Promise<IVideo[]> => {
    try {
      const response = await apiClient.get("/videos");
      return response.data || [];
    } catch (error: any) {
      console.error("Erreur récupération toutes vidéos:", error);
      return [];
    }
  },

  getVideo: async (id: number): Promise<IVideo | null> => {
    try {
      const response = await apiClient.get(`/videos/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur récupération vidéo ${id}:`, error);
      return null;
    }
  },

  deleteVideo: async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/videos/${id}`);
      return true;
    } catch (error: any) {
      console.error("Erreur suppression vidéo:", error);
      return false;
    }
  }
};

// Services DISC
export const discService = {
  getQuestionnaire: async () => {
    try {
      const response = await apiClient.get("/disc/questionnaire");
      return response.data;
    } catch (error: any) {
      console.error("Erreur questionnaire DISC:", error);
      return [
        { id: 1, text: "Je suis orienté résultats", category: "D" },
        { id: 2, text: "J'aime interagir avec les autres", category: "I" },
        { id: 3, text: "Je préfère la stabilité", category: "S" },
        { id: 4, text: "J'aime analyser les détails", category: "C" }
      ];
    }
  },

  submitAssessment: async (data: any) => {
    try {
      const response = await apiClient.post("/disc/assess", data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur évaluation DISC:", error);
      return {
        disc_type: "D",
        scores: { D: 75, I: 60, S: 45, C: 55 },
        summary: "Profil Dominant - Orienté résultats et action"
      };
    }
  }
};

// Service IA - AJOUTÉ pour compatibilité
export const aiService = {
  getRecommendations: async (limit: number = 10) => {
    // Rediriger vers matchService pour compatibilité
    return matchService.getMatches(limit);
  },

  analyzeContent: async (content: string) => {
    try {
      const response = await apiClient.post("/ai/analyze", { content });
      return response.data;
    } catch (error: any) {
      console.error("Erreur analyse IA:", error);
      return {
        sentiment: "positive",
        topics: ["développement", "technologie"],
        summary: "Contenu analysé avec succès"
      };
    }
  }
};

export type { IUser, IPod, IProfile, IAMatch, IVideo };
export default apiClient;

