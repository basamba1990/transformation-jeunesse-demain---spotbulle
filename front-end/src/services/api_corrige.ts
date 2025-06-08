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
  withCredentials: false, // CORRIGÉ : Désactiver pour éviter les problèmes CORS
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

// Intercepteur pour gérer les erreurs - AMÉLIORÉ
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

// Service d'authentification CORRIGÉ
export const authService = {
  loginUser: async (userData: { email: string; password: string }): Promise<string> => {
    try {
      console.log("Tentative de connexion avec:", userData.email);
      
      // CORRIGÉ : Utiliser form-data comme attendu par FastAPI OAuth2
      const formData = new FormData();
      formData.append("username", userData.email);
      formData.append("password", userData.password);
      
      const response = await apiClient.post("/auth/login", formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
      });
      
      console.log("Connexion réussie:", response.data);
      
      // Stocker le token
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

// Service de profil CORRIGÉ
export const profileService = {
  getMyProfile: async (): Promise<IProfile | null> => {
    try {
      console.log("Récupération du profil utilisateur...");
      const response = await apiClient.get("/profiles/me");
      console.log("Profil récupéré:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur récupération profil:", error);
      
      // Si le profil n'existe pas, retourner null au lieu d'une erreur
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

// Service Pod CORRIGÉ
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
  }
};

// Services DISC CORRIGÉS
export const discService = {
  getQuestionnaire: async () => {
    try {
      const response = await apiClient.get("/disc/questionnaire");
      return response.data;
    } catch (error: any) {
      console.error("Erreur questionnaire DISC:", error);
      // Retourner des questions de démonstration
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
      // Retourner des résultats de démonstration
      return {
        disc_type: "D",
        scores: { D: 75, I: 60, S: 45, C: 55 },
        summary: "Profil Dominant - Orienté résultats et action"
      };
    }
  }
};

export type { IUser, IPod, IProfile };
export default apiClient;

