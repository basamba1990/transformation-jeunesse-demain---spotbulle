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

    // Ne pas forcer Content-Type si FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Interfaces ---
export interface IUser {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface IPod {
  id: number;
  title: string;
  description: string | null;
  audio_file_url: string | null;
  transcription: string | null;
  tags: string[] | null;
  owner_id: number;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface IProfile {
  user_id: number;
  bio: string | null;
  profile_picture_url: string | null;
  disc_type: string | null;
  disc_assessment_results: any | null;
  interests: string[] | null;
  skills: string[] | null;
  objectives: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

// --- Authentification ---
export const loginUser = async (credentials: URLSearchParams) => {
  try {
    const response = await apiClient.post("/auth/token", credentials, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const token = response.data.access_token;
    if (token) {
      localStorage.setItem("spotbulle_token", token);
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const registerUser = async (
  userData: Omit<IUser, "id" | "created_at" | "updated_at">
) => {
  try {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<IUser> => {
  try {
    const response = await apiClient.get("/auth/users/me");
    return response.data;
  } catch (error: any) {
    if ([401, 403].includes(error?.response?.status)) {
      logoutUser();
    }
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("spotbulle_token");
  window.location.href = "/login";
};

// --- Pods ---
export type IPodCreateData = FormData;
export type IPodUpdateData = FormData;

export const createPod = async (data: IPodCreateData): Promise<IPod> => {
  const response = await apiClient.post("/pods/", data);
  return response.data;
};

export const fetchAllPods = async (
  skip = 0,
  limit = 100
): Promise<IPod[]> => {
  const response = await apiClient.get(`/pods/?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const fetchMyPods = async (
  skip = 0,
  limit = 100
): Promise<IPod[]> => {
  const response = await apiClient.get(`/pods/mine?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getPod = async (podId: number): Promise<IPod> => {
  const response = await apiClient.get(`/pods/${podId}`);
  return response.data;
};

export const updatePod = async (
  podId: number,
  data: IPodUpdateData
): Promise<IPod> => {
  const response = await apiClient.put(`/pods/${podId}`, data);
  return response.data;
};

export const deletePod = async (podId: number): Promise<void> => {
  await apiClient.delete(`/pods/${podId}`);
};

export const transcribePod = async (podId: number): Promise<IPod> => {
  const response = await apiClient.post(`/pods/${podId}/transcribe`);
  return response.data;
};

// --- Profil utilisateur ---
export const fetchMyProfile = async (): Promise<IProfile> => {
  const response = await apiClient.get("/profiles/me");
  return response.data;
};

export const updateMyProfile = async (
  data: Partial<IProfile>
): Promise<IProfile> => {
  const response = await apiClient.put("/profiles/me", data);
  return response.data;
};

// --- DISC ---
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

export interface DISCResultsResponse {
  disc_type: string;
  scores: DISCScores;
  raw_scores: DISCScores;
  answers_summary: { question_id: number; answer: number }[];
}

export interface DISCAssessmentRequest {
  answers: { question_id: number; answer: number }[];
}

export const getDISCQuestionnaire = async (): Promise<DISCQuestion[]> => {
  const response = await apiClient.get("/profiles/disc/questionnaire");
  return response.data;
};

export const submitDISCAssessment = async (
  data: DISCAssessmentRequest
): Promise<DISCResultsResponse> => {
  const response = await apiClient.post("/profiles/disc/assess", data);
  return response.data;
};

export const getMyDISCResults = async (): Promise<DISCResultsResponse> => {
  const response = await apiClient.get("/profiles/disc/results");
  return response.data;
};

// --- Services IA ---
export interface IAMatch {
  user: IUser;
  profile: IProfile | null;
  match_score: number;
  score_details: {
    disc_score: number;
    interests_score: number;
    content_score: number;
    objectives_score: number;
    overall_score: number;
  };
  match_reason: string;
}

export const fetchIAMatches = async (
  limit = 10,
  use_openai_embeddings = false
): Promise<IAMatch[]> => {
  const response = await apiClient.get(
    `/ia/matches?limit=${limit}&use_openai_embeddings=${use_openai_embeddings}`
  );
  return response.data;
};

export interface IABotResponse {
  response?: string;
  error?: string;
}

export const chatWithIABot = async (
  prompt: string
): Promise<IABotResponse> => {
  const response = await apiClient.post("/ia/bot/chat", { prompt });
  return response.data;
};

export default apiClient;
