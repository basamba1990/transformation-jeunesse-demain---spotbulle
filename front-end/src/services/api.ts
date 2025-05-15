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
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("spotbulle_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
    const response = await apiClient.get("/profiles/profiles/disc/questionnaire");
    return response.data;
  },
  
  submitAssessment: async (data: DISCAssessmentRequest): Promise<DISCResultsResponse> => {
    const response = await apiClient.post("/profiles/profiles/disc/assess", data);
    return response.data;
  },
  
  getResults: async (): Promise<DISCResultsResponse> => {
    const response = await apiClient.get("/profiles/profiles/disc/results");
    return response.data;
  }
};

// Services Pod
export const podService = {
  fetchAll: async (): Promise<IPod[]> => {
    const response = await apiClient.get("/pods/pods");
    return response.data;
  },

  fetchMyPods: async (): Promise<IPod[]> => {
    const response = await apiClient.get("/pods/pods/me");
    return response.data;
  },

  deletePod: async (id: number): Promise<void> => {
    await apiClient.delete(`/pods/pods/${id}`);
  },

  transcribePod: async (id: number): Promise<void> => {
    await apiClient.post(`/pods/pods/${id}/transcribe`);
  },

  createPod: async (data: FormData): Promise<IPod> => {
    const response = await apiClient.post("/pods/pods", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
};

// Service d'authentification
export const authService = {
  loginUser: async (credentials: { email: string; password: string }): Promise<string> => {
    const params = new URLSearchParams();
    params.append("username", credentials.email);
    params.append("password", credentials.password);
    
    const response = await apiClient.post("/auth/auth/token", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data.access_token;
  },

  getCurrentUser: async (): Promise<IUser> => {
    const response = await apiClient.get("/auth/auth/me");
    return response.data;
  },

  register: async (userData: { 
    email: string; 
    password: string; 
    full_name: string 
  }): Promise<IUser> => {
    const response = await apiClient.post("/auth/auth/register", userData);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem("spotbulle_token");
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

