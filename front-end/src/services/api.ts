import axios from "axios";
import type { DISCScores, DISCResults } from "../schemas/disc_schema";

// Configuration de la base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  "https://spotbulle-backend-sack.onrender.com/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Ajout de withCredentials pour permettre l'envoi des cookies cross-origin
  withCredentials: true,
});

// Fonction pour stocker les tokens
const storeTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("spotbulle_token", accessToken);
  localStorage.setItem("spotbulle_refresh_token", refreshToken);
  console.log("Tokens stockés dans localStorage");
};

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("spotbulle_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Ajout d'un log pour débogage
    console.log("Token envoyé dans la requête:", token.substring(0, 15) + "...");
  } else {
    console.log("Aucun token trouvé dans localStorage");
  }
  return config;
});

// Intercepteur pour gérer les erreurs 401 (token expiré)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 et que la requête n'a pas déjà été retentée
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tenter de rafraîchir le token
        const newToken = await authService.refreshToken();
        
        // Mettre à jour le token dans la requête originale
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retenter la requête originale avec le nouveau token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si le rafraîchissement échoue, rediriger vers la page de connexion
        console.error("Échec du rafraîchissement du token:", refreshError);
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

// Services Pod
export const podService = {
  fetchAll: async (): Promise<IPod[]> => {
    const response = await apiClient.get("/pods");
    return response.data;
  },

  fetchMyPods: async (): Promise<IPod[]> => {
    const response = await apiClient.get("/pods/me");
    return response.data;
  },

  deletePod: async (id: number): Promise<void> => {
    await apiClient.delete(`/pods/${id}`);
  },

  transcribePod: async (id: number): Promise<void> => {
    await apiClient.post(`/pods/${id}/transcribe`);
  },

  createPod: async (data: FormData): Promise<IPod> => {
    const response = await apiClient.post("/pods", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
};

// Service d'authentification
export const authService = {
  // Signature pour accepter un objet avec email et password
  loginUser: async (userData: { email: string; password: string }): Promise<string> => {
    const params = new URLSearchParams();
    params.append("username", userData.email);
    params.append("password", userData.password);
    
    try {
      const response = await apiClient.post("/auth/token", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      
      // Stocker les deux tokens
      storeTokens(response.data.access_token, response.data.refresh_token);
      
      // Ajout d'un log pour débogage
      console.log("Token reçu du backend:", response.data.access_token.substring(0, 15) + "...");
      
      return response.data.access_token;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error;
    }
  },

  // Nouvelle fonction pour rafraîchir le token
  refreshToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem("spotbulle_refresh_token");
    if (!refreshToken) {
      console.error("Échec du rafraîchissement du token: Aucun refresh token disponible");
      throw new Error("No refresh token available");
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, 
        { refresh_token: refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      
      // Stocker les nouveaux tokens
      storeTokens(response.data.access_token, response.data.refresh_token);
      console.log("Token rafraîchi avec succès");
      
      return response.data.access_token;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      // En cas d'échec, déconnecter l'utilisateur
      authService.logout();
      throw error;
    }
  },

  getCurrentUser: async (): Promise<IUser> => {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur courant:", error);
      throw error;
    }
  },

  register: async (userData: { 
    email: string; 
    password: string; 
    full_name: string 
  }): Promise<IUser> => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem("spotbulle_token");
    localStorage.removeItem("spotbulle_refresh_token");
    console.log("Tokens supprimés du localStorage");
  }
};

// Service de profil
export const profileService = {
  getMyProfile: async (): Promise<IProfile> => {
    const response = await apiClient.get("/profiles/profiles/me");
    return response.data;
  },

  updateProfile: async (data: Partial<ProfileData>): Promise<IProfile> => {
    const response = await apiClient.put("/profiles/profiles/me", data);
    return response.data;
  },

  uploadProfilePicture: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await apiClient.post("/profiles/profiles/me/picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.profile_picture_url;
  }
};

// Types exports
export type ProfileData = Omit<IProfile, "user_id" | "created_at" | "updated_at">;

export type { 
  IUser, 
  IPod, 
  IProfile, 
  DISCQuestion, 
  DISCAssessmentRequest 
};

export default apiClient;
