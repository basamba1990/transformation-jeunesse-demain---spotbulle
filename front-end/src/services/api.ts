import axios from "axios";
import type { DISCScores, DISCResults } from "../schemas/disc_schema";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Interfaces principales
export interface IUser {
  id: number;
  email: string;
  full_name: string;
  is_active?: boolean;
  is_superuser?: boolean;
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

export type ProfileData = Omit<IProfile, "user_id" | "created_at" | "updated_at">;

// Authentification
export const authService = {
  login: (credentials: URLSearchParams) =>
    apiClient.post("/auth/token", credentials, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }),
  register: (userData: Omit<IUser, "id" | "created_at" | "updated_at">) =>
    apiClient.post("/auth/register", userData),
  getCurrentUser: (): Promise<IUser> =>
    apiClient.get("/auth/users/me").then(res => res.data),
  logout: () => localStorage.removeItem("spotbulle_token")
};

// DISC
export const discService = {
  getQuestionnaire: (): Promise<Array<{ id: number; text: string; category: string }>> =>
    apiClient.get("/profiles/disc/questionnaire").then(res => res.data),
  submitAssessment: (data: { answers: Array<{ question_id: number; answer: number }> }): Promise<DISCResults> =>
    apiClient.post("/profiles/disc/assess", data).then(res => res.data),
  getResults: (): Promise<DISCResults> =>
    apiClient.get("/profiles/disc/results").then(res => res.data)
};

// Intelligence artificielle
export const aiService = {
  getMatches: (limit = 10): Promise<Array<{
    user: IUser;
    profile: IProfile | null;
    match_score: number;
    score_details: Record<string, number>;
    match_reason: string;
  }>> =>
    apiClient.get(`/ia/matches?limit=${limit}`).then(res => res.data)
};

// Nouveau : Service de gestion du profil utilisateur
export const profileService = {
  getMyProfile: (): Promise<IProfile> =>
    apiClient.get("/profiles/me").then(res => res.data),

  updateProfile: (data: Partial<ProfileData>) =>
    apiClient.patch("/profiles/me", data),

  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/profiles/me/picture", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }
};

// Export par défaut du client
export default apiClient;
