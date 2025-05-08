// frontend/src/services/api.ts
import axios from "axios";

// Définir l'URL de base de l'API. 
// Idéalement, cela devrait provenir d'une variable d'environnement.
const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

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
    (error) => {
        return Promise.reject(error);
    }
);

export interface IUser {
    id: number;
    email: string;
    full_name: string | null;
    is_active: boolean;
    is_superuser: boolean;
    created_at: string; // ou Date
    updated_at: string; // ou Date
}

export interface IPod {
    id: number;
    title: string;
    description: string | null;
    audio_file_url: string | null;
    transcription: string | null;
    tags: string[] | null;
    owner_id: number;
    // Ajouter les champs de date si présents dans le schéma Pod backend
    created_at: string; // ou Date
    updated_at: string; // ou Date
}

export interface IProfile {
    user_id: number;
    bio: string | null;
    profile_picture_url: string | null;
    disc_type: string | null;
    disc_assessment_results: any | null; 
    interests: string[] | null;
    skills: string[] | null;
    objectives: string | null; // Ajouté pour le matching
    // Ajouter les champs de date si présents dans le schéma Profile backend
    created_at: string; // ou Date
    updated_at: string; // ou Date
}

export interface IPodCreateData extends FormData {}
export interface IPodUpdateData extends FormData {}

// --- Auth --- 
export const loginUser = async (credentials: URLSearchParams) => {
    try {
        const response = await apiClient.post("/auth/token", credentials, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        if (response.data.access_token) {
            localStorage.setItem("spotbulle_token", response.data.access_token);
        }
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
};

export const registerUser = async (userData: any) => {
    try {
        const response = await apiClient.post("/auth/register", userData);
        return response.data;
    } catch (error) {
        console.error("Error during registration:", error);
        throw error;
    }
};

export const getCurrentUser = async (): Promise<IUser> => {
    try {
        const response = await apiClient.get("/auth/users/me");
        return response.data;
    } catch (error) {
        console.error("Error fetching current user:", error);
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
            logoutUser();
        }
        throw error;
    }
};

export const logoutUser = () => {
    localStorage.removeItem("spotbulle_token");
    // Optionnel: rediriger vers la page de connexion ou rafraîchir la page
    // window.location.href = 
'/login
'; 
};

// --- Pods --- 
export const createPod = async (podFormData: IPodCreateData): Promise<IPod> => {
    try {
        const response = await apiClient.post("/pods/", podFormData);
        return response.data;
    } catch (error) {
        console.error("Error creating pod:", error);
        throw error;
    }
};

export const fetchAllPods = async (skip: number = 0, limit: number = 100): Promise<IPod[]> => {
    try {
        const response = await apiClient.get(`/pods/?skip=${skip}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching all pods:", error);
        throw error;
    }
};

export const fetchMyPods = async (skip: number = 0, limit: number = 100): Promise<IPod[]> => {
    try {
        const response = await apiClient.get(`/pods/mine?skip=${skip}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching my pods:", error);
        throw error;
    }
};

export const getPod = async (podId: number): Promise<IPod> => {
    try {
        const response = await apiClient.get(`/pods/${podId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching pod ${podId}:`, error);
        throw error;
    }
};

export const updatePod = async (podId: number, podFormData: IPodUpdateData): Promise<IPod> => {
    try {
        const response = await apiClient.put(`/pods/${podId}`, podFormData);
        return response.data;
    } catch (error) {
        console.error(`Error updating pod ${podId}:`, error);
        throw error;
    }
};

export const deletePod = async (podId: number): Promise<void> => {
    try {
        await apiClient.delete(`/pods/${podId}`);
    } catch (error) {
        console.error(`Error deleting pod ${podId}:`, error);
        throw error;
    }
};

export const transcribePod = async (podId: number): Promise<IPod> => {
    try {
        const response = await apiClient.post(`/pods/${podId}/transcribe`);
        return response.data;
    } catch (error) {
        console.error(`Error transcribing pod ${podId}:`, error);
        throw error;
    }
};

// --- Profiles --- 
export const fetchMyProfile = async (): Promise<IProfile> => {
    try {
        const response = await apiClient.get("/profiles/me");
        return response.data;
    } catch (error) {
        console.error("Error fetching my profile:", error);
        throw error;
    }
};

export const updateMyProfile = async (profileData: Partial<IProfile>): Promise<IProfile> => {
    try {
        const response = await apiClient.put("/profiles/me", profileData);
        return response.data;
    } catch (error) {
        console.error("Error updating my profile:", error);
        throw error;
    }
};

// --- DISC Assessment --- 
export interface DISCQuestion {
    id: number;
    text: string;
    category: string; // D, I, S, C
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
    answers: { question_id: number; answer: number }[]; // answer: 1 (moins) à 4 (plus)
}

export const getDISCQuestionnaire = async (): Promise<DISCQuestion[]> => {
    try {
        const response = await apiClient.get("/profiles/disc/questionnaire");
        return response.data;
    } catch (error) {
        console.error("Error fetching DISC questionnaire:", error);
        throw error;
    }
};

export const submitDISCAssessment = async (assessmentData: DISCAssessmentRequest): Promise<DISCResultsResponse> => {
    try {
        const response = await apiClient.post("/profiles/disc/assess", assessmentData);
        return response.data;
    } catch (error) {
        console.error("Error submitting DISC assessment:", error);
        throw error;
    }
};

export const getMyDISCResults = async (): Promise<DISCResultsResponse> => {
    try {
        const response = await apiClient.get("/profiles/disc/results");
        return response.data;
    } catch (error) {
        console.error("Error fetching DISC results:", error);
        throw error;
    }
};

// --- IA Services --- 
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

export const fetchIAMatches = async (limit: number = 10, use_openai_embeddings: boolean = false): Promise<IAMatch[]> => {
    try {
        const response = await apiClient.get(`/ia/matches?limit=${limit}&use_openai_embeddings=${use_openai_embeddings}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching IA matches:", error);
        throw error;
    }
};

export interface IABotResponse {
    response?: string;
    error?: string;
}

export const chatWithIABot = async (prompt: string): Promise<IABotResponse> => {
    try {
        const response = await apiClient.post("/ia/bot/chat", { prompt });
        return response.data;
    } catch (error) {
        console.error("Error chatting with IA bot:", error);
        throw error;
    }
};

export default apiClient;

