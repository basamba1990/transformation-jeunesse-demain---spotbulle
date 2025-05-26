// frontend/src/services/api.ts
import axios from "axios";
import type { DISCScores, DISCResults } from "../schemas/disc_schema";

// Configuration de la base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  "https://spotbulle-backend-tydv.onrender.com/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 15000, // Augmentation du timeout pour les requêtes lentes
});

// Fonction pour stocker les tokens
const storeTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("spotbulle_token", accessToken);
  localStorage.setItem("spotbulle_refresh_token", refreshToken);
};

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("spotbulle_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs 401 (token expiré)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await authService.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
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

export interface IPodCreateData {
  title: string;
  description?: string;
  tags?: string;
  audio_file: File;
}

export interface IPodUpdateData {
  title?: string;
  description?: string;
  tags?: string;
  audio_file?: File;
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

// Interfaces DISC
export interface DISCQuestion {
  id: number;
  text: string;
  category: string;
}

export interface DISCAssessmentRequest {
  answers: Array<{ question_id: number; answer: number }>;
}

export interface DISCResultsResponse {
  disc_type: string;
  scores: DISCScores;
  summary?: string;
}

// Services DISC
export const discService = {
  getQuestionnaire: async (): Promise<DISCQuestion[]> => {
    const response = await apiClient.get("/profiles/disc/questionnaire");
    return response.data;
  },
  
  submitAssessment: async (data: DISCAssessmentRequest): Promise<DISCResultsResponse> => {
    const response = await apiClient.post("/profiles/disc/assess", data);
    return response.data;
  },
  
  getResults: async (): Promise<DISCResultsResponse> => {
    const response = await apiClient.get("/profiles/disc/results");
    return response.data;
  }
};

// Services Pod corrigés avec gestion d'erreur améliorée
export const podService = {
  fetchAll: async (): Promise<IPod[]> => {
    try {
      console.log("Début de la récupération de tous les pods...");
      const response = await apiClient.get("/pods");
      console.log("Pods récupérés avec succès:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur récupération des pods:", error);
      // Afficher plus de détails sur l'erreur pour le débogage
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw new Error("Impossible de charger les pods");
    }
  },

  fetchMyPods: async (): Promise<IPod[]> => {
    try {
      console.log("Début de la récupération de mes pods...");
      const response = await apiClient.get("/pods/me");
      console.log("Mes pods récupérés avec succès:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur récupération des pods utilisateur:", error);
      // Afficher plus de détails sur l'erreur pour le débogage
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw new Error("Impossible de charger vos pods");
    }
  },

  getPod: async (id: number): Promise<IPod> => {
    try {
      console.log(`Début de la récupération du pod ${id}...`);
      const response = await apiClient.get(`/pods/${id}`);
      console.log("Pod récupéré avec succès:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur récupération du pod ${id}:`, error);
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error("Impossible de charger le pod");
    }
  },

  deletePod: async (id: number): Promise<void> => {
    try {
      console.log(`Début de la suppression du pod ${id}...`);
      await apiClient.delete(`/pods/${id}`);
      console.log(`Pod ${id} supprimé avec succès`);
    } catch (error: any) {
      console.error("Erreur suppression pod:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error("Échec de la suppression du pod");
    }
  },

  transcribePod: async (id: number): Promise<void> => {
    try {
      console.log(`Début de la transcription du pod ${id}...`);
      await apiClient.post(`/pods/${id}/transcribe`);
      console.log(`Pod ${id} transcrit avec succès`);
    } catch (error: any) {
      console.error("Erreur transcription pod:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error("Échec de la transcription audio");
    }
  },

  createPod: async (data: FormData): Promise<IPod> => {
    try {
      console.log("Début de la création du pod...");
      console.log("Données envoyées:", Array.from(data.entries()));
      
      const response = await apiClient.post("/pods", data, {
        headers: { 
          "Content-Type": "multipart/form-data",
          // S'assurer que le token est bien envoyé
          "Authorization": `Bearer ${localStorage.getItem("spotbulle_token")}`
        },
      });
      
      console.log("Pod créé avec succès:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur création pod:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error("Échec de la création du pod");
    }
  },

  updatePod: async (id: number, data: FormData): Promise<IPod> => {
    try {
      console.log(`Début de la mise à jour du pod ${id}...`);
      console.log("Données envoyées:", Array.from(data.entries()));
      
      const response = await apiClient.put(`/pods/${id}`, data, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("spotbulle_token")}`
        },
      });
      
      console.log("Pod mis à jour avec succès:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Erreur mise à jour pod ${id}:`, error);
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error("Échec de la mise à jour du pod");
    }
  }
};

// Service d'authentification avec gestion d'erreur améliorée
export const authService = {
  loginUser: async (userData: { email: string; password: string }): Promise<string> => {
    try {
      console.log("Tentative de connexion...");
      const params = new URLSearchParams();
      params.append("username", userData.email);
      params.append("password", userData.password);
      
      const response = await apiClient.post("/auth/token", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      
      console.log("Connexion réussie, tokens reçus");
      storeTokens(response.data.access_token, response.data.refresh_token);
      return response.data.access_token;
    } catch (error: any) {
      console.error("Erreur connexion:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error("Identifiants incorrects ou problème de connexion");
    }
  },

  refreshToken: async (): Promise<string> => {
    try {
      console.log("Tentative de rafraîchissement du token...");
      const refreshToken = localStorage.getItem("spotbulle_refresh_token");
      if (!refreshToken) throw new Error("Aucun token de rafraîchissement");
      
      const response = await apiClient.post("/auth/refresh", { refresh_token: refreshToken });
      console.log("Token rafraîchi avec succès");
      storeTokens(response.data.access_token, response.data.refresh_token);
      return response.data.access_token;
    } catch (error: any) {
      console.error("Erreur rafraîchissement token:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error("Session expirée, veuillez vous reconnecter");
    }
  },

  getCurrentUser: async (): Promise<IUser> => {
    try {
      console.log("Récupération des informations utilisateur...");
      const response = await apiClient.get("/auth/me");
      console.log("Informations utilisateur récupérées:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur récupération utilisateur:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error("Impossible de charger le profil utilisateur");
    }
  },

  register: async (userData: { 
    email: string; 
    password: string; 
    full_name: string 
  }): Promise<IUser> => {
    try {
      console.log("Tentative d'inscription...");
      const response = await apiClient.post("/auth/register", userData);
      console.log("Inscription réussie:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur inscription:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error("Échec de l'inscription - vérifiez les données saisies");
    }
  },

  logout: (): void => {
    localStorage.removeItem("spotbulle_token");
    localStorage.removeItem("spotbulle_refresh_token");
    console.log("Déconnexion réussie");
  }
};

// Service de profil avec gestion améliorée
export const profileService = {
  getMyProfile: async (): Promise<IProfile> => {
    try {
      console.log("Récupération du profil utilisateur...");
      const response = await apiClient.get("/profiles/me");
      console.log("Profil récupéré avec succès:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur récupération profil:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error("Impossible de charger votre profil");
    }
  },

  updateProfile: async (data: Partial<ProfileData>): Promise<IProfile> => {
    try {
      console.log("Mise à jour du profil...");
      console.log("Données envoyées:", data);
      const response = await apiClient.put("/profiles/me", data);
      console.log("Profil mis à jour avec succès:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur mise à jour profil:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error("Échec de la mise à jour du profil");
    }
  },

  uploadProfilePicture: async (file: File): Promise<string> => {
    try {
      console.log("Envoi de la photo de profil...");
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await apiClient.post("/profiles/me/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Photo de profil envoyée avec succès:", response.data);
      return response.data.profile_picture_url;
    } catch (error: any) {
      console.error("Erreur upload photo:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", {
          status: error.response.status,
          data: error.response.data
        });
      }
      throw new Error("Échec de l'envoi de la photo de profil");
    }
  }
};

// Types exports
export type ProfileData = Omit<IProfile, "user_id" | "created_at" | "updated_at">;

// Export direct des fonctions utilisées dans PodForm.tsx
export const { getPod, createPod, updatePod } = podService;

export type { 
  IUser, 
  IPod, 
  IProfile, 
  DISCQuestion, 
  DISCAssessmentRequest,
  IPodCreateData,
  IPodUpdateData
};

export default apiClient;
