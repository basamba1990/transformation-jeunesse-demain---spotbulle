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
  password?: string;
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
  results: DISCResults;
}

// Services
export const discService = {
  getQuestionnaire: (): Promise<DISCQuestion[]> =>
    apiClient.get("/profiles/disc/questionnaire").then(res => res.data),
  
  submitAssessment: (data: DISCAssessmentRequest): Promise<DISCResultsResponse> =>
    apiClient.post("/profiles/disc/assess", data).then(res => res.data),
  
  getResults: (): Promise<DISCResultsResponse> =>
    apiClient.get("/profiles/disc/results").then(res => res.data)
};

// Exportations individuelles Pod
export const fetchAllPods = (): Promise<IPod[]> => 
  apiClient.get("/pods").then(res => res.data);

export const fetchMyPods = (): Promise<IPod[]> => 
  apiClient.get("/pods/me").then(res => res.data);

export const deletePod = (id: number) => 
  apiClient.delete(`/pods/${id}`);

export const transcribePod = (id: number) => 
  apiClient.post(`/pods/${id}/transcribe`);

// Service groupé Pod
export const podService = {
  fetchAll: fetchAllPods,
  fetchMyPods,
  deletePod,
  transcribePod,
  createPod: (data: FormData) => 
    apiClient.post("/pods", data, {
      headers: { "Content-Type": "multipart/form-data" }
    })
};

// Service d'authentification
export const authService = {
  loginUser: (credentials: URLSearchParams) => 
    apiClient.post<{ access_token: string }>("/auth/token", credentials, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }),
  
  getCurrentUser: (): Promise<IUser> =>
    apiClient.get("/auth/users/me").then(res => res.data),

  register: (userData: Omit<IUser, "id" | "created_at" | "updated_at">) =>
    apiClient.post("/auth/register", userData),

  logout: () => localStorage.removeItem("spotbulle_token")
};

// Exports individuels Auth
export const loginUser = authService.loginUser;
export const getCurrentUser = authService.getCurrentUser;

// Service de profil
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
