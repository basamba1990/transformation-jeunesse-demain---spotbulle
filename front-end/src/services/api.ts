// frontend/src/services/api.ts
import axios from "axios";

// --- Configuration de base ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// --- Intercepteur : ajout du token JWT et Content-Type ---
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("spotbulle_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Interfaces principales ---
export interface IUser {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface IPod {
  id: number;
  title: string;
  description: string | null;
  audio_file_url: string | null;
  transcription: string | null;
  tags: string[] | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface IProfile {
  user_id: number;
  bio: string | null;
  profile_picture_url: string | null;
  disc_type: string | null;
  disc_assessment_results: DISCScores | null;
  interests: string[] | null;
  skills: string[] | null;
  objectives: string | null;
  created_at: string;
  updated_at: string;
}

// --- Types et interfaces pour DISC ---
export interface DISCQuestion {
  id: number;
  text: string;
  category: "D" | "I" | "S" | "C";
}

export interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface DISCResults {
  disc_type: string;
  scores: DISCScores;
  raw_scores: DISCScores;
  answers_summary: { question_id: number; answer: number }[];
  summary: string;
}

export interface DISCAssessmentRequest {
  answers: Array<{
    question_id: number;
    answer: number;
  }>;
}

// --- Types pour l'IA ---
export interface IAMatch {
  user: IUser;
  profile: Omit<IProfile, 'user_id' | 'created_at' | 'updated_at'> | null;
  match_score: number;
  score_details: {
    disc_score: number;
    interests_score: number;
    content_score: number;
    content_analysis: string;
    objectives_score: number;
  };
  match_reason: string;
}

export interface IABotResponse {
  response?: string;
  error?: string;
}

// --- Service d'authentification ---
export const authService = {
  login: async (credentials: URLSearchParams) => {
    const response = await apiClient.post("/auth/token", credentials, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    
    if (response.data.access_token) {
      localStorage.setItem("spotbulle_token", response.data.access_token);
    }
    return response.data;
  },

  register: async (userData: Omit<IUser, "id" | "created_at" | "updated_at">) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<IUser> => {
    const response = await apiClient.get("/auth/users/me");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("spotbulle_token");
    window.location.href = "/login";
  }
};

// --- Service des Pods ---
export const podService = {
  create: async (data: FormData): Promise<IPod> => {
    const response = await apiClient.post("/pods/", data);
    return response.data;
  },

  getAll: async (skip = 0, limit = 100): Promise<IPod[]> => {
    const response = await apiClient.get(`/pods/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getMine: async (skip = 0, limit = 100): Promise<IPod[]> => {
    const response = await apiClient.get(`/pods/mine?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getById: async (podId: number): Promise<IPod> => {
    const response = await apiClient.get(`/pods/${podId}`);
    return response.data;
  },

  update: async (podId: number, data: FormData): Promise<IPod> => {
    const response = await apiClient.put(`/pods/${podId}`, data);
    return response.data;
  },

  delete: async (podId: number): Promise<void> => {
    await apiClient.delete(`/pods/${podId}`);
  },

  transcribe: async (podId: number): Promise<IPod> => {
    const response = await apiClient.post(`/pods/${podId}/transcribe`);
    return response.data;
  }
};

// --- Service du profil utilisateur ---
export const profileService = {
  getMyProfile: async (): Promise<IProfile> => {
    const response = await apiClient.get("/profiles/me");
    return response.data;
  },

  updateProfile: async (data: Partial<IProfile>): Promise<IProfile> => {
    const response = await apiClient.put("/profiles/me", data);
    return response.data;
  }
};

// --- Service DISC ---
export const discService = {
  getQuestionnaire: async (): Promise<DISCQuestion[]> => {
    const response = await apiClient.get("/profiles/disc/questionnaire");
    return response.data;
  },

  submitAssessment: async (data: DISCAssessmentRequest): Promise<DISCResults> => {
    const response = await apiClient.post("/profiles/disc/assess", data);
    return response.data;
  },

  getResults: async (): Promise<DISCResults> => {
    const response = await apiClient.get("/profiles/disc/results");
    return response.data;
  }
};

// --- Service IA ---
export const aiService = {
  getMatches: async (limit = 10, useOpenAI = false): Promise<IAMatch[]> => {
    const response = await apiClient.get(
      `/ia/matches?limit=${limit}&use_openai_embeddings=${useOpenAI}`
    );
    return response.data;
  },

  chatWithBot: async (prompt: string): Promise<IABotResponse> => {
    const response = await apiClient.post("/ia/bot/chat", { prompt });
    return response.data;
  }
};

export default apiClient;
