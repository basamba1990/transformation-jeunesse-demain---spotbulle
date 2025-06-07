import axios from "axios";
import type { DISCScores, DISCResults } from "../schemas/disc_schema";
import { logApiRequest, logApiResponse, logError } from "../utils/debug";
import { storeTokens, getAccessToken, getRefreshToken, isInDemoMode } from "../utils/auth";

// Configuration de la base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  console.error("Variable d'environnement VITE_API_BASE_URL non définie");
}

// Constantes pour la configuration de l'API
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "30000", 10);
const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE || "209715200", 10); // 200 Mo par défaut

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: API_TIMEOUT,
  maxContentLength: MAX_FILE_SIZE,
  maxBodyLength: MAX_FILE_SIZE,
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log de la requête en mode debug
  logApiRequest(config.method?.toUpperCase() || 'GET', config.url || '', config.data);
  
  return config;
});

// Intercepteur pour gérer les erreurs 401 (token expiré)
apiClient.interceptors.response.use(
  (response) => {
    // Log de la réponse en mode debug
    logApiResponse(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url || '',
      response.status,
      response.data
    );
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si pas de réponse du serveur, retourner immédiatement l'erreur
    if (!error.response) {
      logError("Erreur réseau - Serveur inaccessible:", error.message);
      return Promise.reject(new Error("Serveur inaccessible. Veuillez réessayer plus tard."));
    }
    
    // Log de l'erreur en mode debug
    logApiResponse(
      originalRequest.method?.toUpperCase() || 'GET',
      originalRequest.url || '',
      error.response?.status || 0,
      error.response?.data
    );
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await authService.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        authService.logout();
        logError("Session expirée:", refreshError);
        return Promise.reject(new Error("Votre session a expiré. Veuillez vous reconnecter."));
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

// Fonctions pour obtenir des données de démo
function getDemoUser(): IUser {
  return {
    id: 1,
    email: "demo@spotbulle.com",
    full_name: "Utilisateur Démo",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function getDemoProfile(): IProfile {
  return {
    user_id: 1,
    bio: "Ceci est une bio de démonstration pour tester l'interface utilisateur.",
    profile_picture_url: "https://via.placeholder.com/150",
    disc_type: "D",
    disc_assessment_results: {
      D: 0.8,
      I: 0.4,
      S: 0.3,
      C: 0.6
    },
    interests: ["Développement", "Musique", "Voyages", "Photographie"],
    skills: ["JavaScript", "React", "TypeScript", "UI/UX"],
    objectives: "Améliorer mes compétences en développement frontend et backend.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function getDemoPods(): IPod[] {
  return [
    {
      id: 1,
      title: "Ma transformation personnelle",
      description: "Partage de mon parcours de développement personnel et des leçons apprises.",
      audio_file_url: "/demo/audio1.mp3",
      transcription: "Transcription de l'audio 1...",
      owner_id: 1,
      created_at: "2025-01-15T10:30:00Z",
      updated_at: "2025-01-15T10:30:00Z",
      tags: ["développement personnel", "transformation"]
    },
    {
      id: 2,
      title: "Conseils pour entrepreneurs",
      description: "Mes conseils pratiques pour les entrepreneurs qui débutent leur aventure.",
      audio_file_url: "/demo/audio2.mp3",
      transcription: "Transcription de l'audio 2...",
      owner_id: 1,
      created_at: "2025-01-14T15:45:00Z",
      updated_at: "2025-01-14T15:45:00Z",
      tags: ["entrepreneuriat", "business", "conseils"]
    }
  ];
}

function getDemoMatches(): any[] {
  return [
    {
      user: {
        id: 1,
        email: "utilisateur1@example.com",
        full_name: "Utilisateur Test 1"
      },
      profile: {
        bio: "Passionné de développement et de nouvelles technologies",
        disc_type: "D",
        interests: ["Développement", "Musique", "Voyages"]
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

// Services DISC
export const discService = {
  getQuestionnaire: async (): Promise<DISCQuestion[]> => {
    try {
      const response = await apiClient.get("/profiles/disc/questionnaire");
      return response.data;
    } catch (error: any) {
      logError("Erreur récupération questionnaire DISC:", error);
      
      if (isInDemoMode()) {
        // Retourner des données de démo
        return [
          { id: 1, text: "Je suis une personne déterminée", category: "D" },
          { id: 2, text: "J'aime être entouré de personnes", category: "I" },
          { id: 3, text: "Je suis patient avec les autres", category: "S" },
          { id: 4, text: "Je suis méthodique dans mon travail", category: "C" }
        ];
      }
      
      throw new Error("Impossible de charger le questionnaire DISC");
    }
  },
  
  submitAssessment: async (data: DISCAssessmentRequest): Promise<DISCResultsResponse> => {
    try {
      const response = await apiClient.post("/profiles/disc/assess", data);
      return response.data;
    } catch (error: any) {
      logError("Erreur soumission évaluation DISC:", error);
      
      if (isInDemoMode()) {
        // Retourner des données de démo
        return {
          disc_type: "D",
          scores: { D: 0.8, I: 0.4, S: 0.3, C: 0.6 },
          summary: "Vous êtes une personne déterminée et orientée vers les résultats."
        };
      }
      
      throw new Error("Échec de l'évaluation DISC");
    }
  },
  
  getResults: async (): Promise<DISCResultsResponse> => {
    try {
      const response = await apiClient.get("/profiles/disc/results");
      return response.data;
    } catch (error: any) {
      logError("Erreur récupération résultats DISC:", error);
      
      if (isInDemoMode()) {
        // Retourner des données de démo
        return {
          disc_type: "D",
          scores: { D: 0.8, I: 0.4, S: 0.3, C: 0.6 },
          summary: "Vous êtes une personne déterminée et orientée vers les résultats."
        };
      }
      
      throw new Error("Impossible de charger vos résultats DISC");
    }
  }
};

// Services Pod avec gestion d'erreur améliorée
export const podService = {
  fetchAll: async (): Promise<IPod[]> => {
    try {
      const response = await apiClient.get("/pods");
      return response.data;
    } catch (error: any) {
      logError("Erreur récupération des pods:", error);
      
      if (isInDemoMode()) {
        // Retourner des données de démo
        return getDemoPods();
      }
      
      throw new Error("Impossible de récupérer les pods. Veuillez réessayer plus tard.");
    }
  },

  fetchMyPods: async (): Promise<IPod[]> => {
    try {
      const response = await apiClient.get("/pods/me");
      return response.data;
    } catch (error: any) {
      logError("Erreur récupération des pods utilisateur:", error);
      
      if (isInDemoMode()) {
        // Retourner des données de démo
        return getDemoPods();
      }
      
      throw new Error("Impossible de récupérer vos pods. Veuillez réessayer plus tard.");
    }
  },

  getPod: async (id: number): Promise<IPod | null> => {
    try {
      const response = await apiClient.get(`/pods/${id}`);
      return response.data;
    } catch (error: any) {
      logError(`Erreur récupération du pod ${id}:`, error);
      
      if (isInDemoMode()) {
        // Retourner des données de démo
        const demoPods = getDemoPods();
        return demoPods.find(pod => pod.id === id) || null;
      }
      
      throw new Error(`Impossible de récupérer le pod ${id}. Veuillez réessayer plus tard.`);
    }
  },

  deletePod: async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/pods/${id}`);
      return true;
    } catch (error: any) {
      logError("Erreur suppression pod:", error);
      
      if (isInDemoMode()) {
        // Simuler une suppression réussie
        return true;
      }
      
      throw new Error("Impossible de supprimer le pod. Veuillez réessayer plus tard.");
    }
  },

  transcribePod: async (id: number): Promise<boolean> => {
    try {
      await apiClient.post(`/pods/${id}/transcribe`);
      return true;
    } catch (error: any) {
      logError("Erreur transcription pod:", error);
      
      if (isInDemoMode()) {
        // Simuler une transcription réussie
        return true;
      }
      
      throw new Error("Impossible de transcrire le pod. Veuillez réessayer plus tard.");
    }
  },

  createPod: async (data: FormData): Promise<IPod | null> => {
    try {
      const response = await apiClient.post("/pods", data, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 1 minute
      });
      
      return response.data;
    } catch (error: any) {
      logError("Erreur création pod:", error);
      
      if (isInDemoMode()) {
        // Simuler une création réussie
        const demoPods = getDemoPods();
        return {
          ...demoPods[0],
          id: Math.floor(Math.random() * 1000) + 10,
          title: data.get('title') as string || "Nouveau pod",
          description: data.get('description') as string || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      throw new Error("Impossible de créer le pod. Veuillez réessayer plus tard.");
    }
  },

  updatePod: async (id: number, data: FormData): Promise<IPod | null> => {
    try {
      const response = await apiClient.put(`/pods/${id}`, data, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 1 minute
      });
      
      return response.data;
    } catch (error: any) {
      logError(`Erreur mise à jour pod ${id}:`, error);
      
      if (isInDemoMode()) {
        // Simuler une mise à jour réussie
        const demoPods = getDemoPods();
        const podToUpdate = demoPods.find(pod => pod.id === id);
        if (podToUpdate) {
          return {
            ...podToUpdate,
            title: data.get('title') as string || podToUpdate.title,
            description: data.get('description') as string || podToUpdate.description,
            updated_at: new Date().toISOString()
          };
        }
        return null;
      }
      
      throw new Error("Impossible de mettre à jour le pod. Veuillez réessayer plus tard.");
    }
  }
};

// Service d'authentification avec gestion d'erreur améliorée
export const authService = {
  loginUser: async (userData: { email: string; password: string }): Promise<string> => {
    try {
      // Pour le mode démo, simuler une connexion réussie
      if (userData.email === "demo@spotbulle.com" || userData.email === "test@example.com") {
        const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRlbW8gVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        const mockRefreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRlbW8gVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        storeTokens(mockToken, mockRefreshToken);
        return mockToken;
      }
      
      // Tentative de connexion au backend réel
      const params = new URLSearchParams();
      params.append("username", userData.email);
      params.append("password", userData.password);
      
      try {
        const response = await apiClient.post("/auth/token", params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        
        storeTokens(response.data.access_token, response.data.refresh_token);
        return response.data.access_token;
      } catch (apiError: any) {
        // Vérifier si l'erreur est due à des identifiants incorrects
        if (apiError.response?.status === 401) {
          throw new Error("Identifiants incorrects. Veuillez réessayer.");
        }
        
        // Si le backend n'est pas accessible, proposer le mode démo
        throw new Error("Impossible de se connecter au serveur. Veuillez réessayer plus tard.");
      }
    } catch (error: any) {
      logError("Erreur connexion:", error);
      throw error;
    }
  },

  refreshToken: async (): Promise<string> => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error("Aucun token de rafraîchissement");
      
      // Pour le mode démo, simuler un rafraîchissement réussi
      if (refreshToken.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")) {
        const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRlbW8gVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        const mockRefreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRlbW8gVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        storeTokens(mockToken, mockRefreshToken);
        return mockToken;
      }
      
      // Tentative de rafraîchissement avec le backend réel
      const response = await apiClient.post("/auth/refresh", { refresh_token: refreshToken });
      storeTokens(response.data.access_token, response.data.refresh_token);
      return response.data.access_token;
    } catch (error: any) {
      logError("Erreur rafraîchissement token:", error);
      throw new Error("Session expirée, veuillez vous reconnecter");
    }
  },

  getCurrentUser: async (): Promise<IUser> => {
    try {
      // Pour le mode démo, retourner un utilisateur fictif
      if (isInDemoMode()) {
        return getDemoUser();
      }
      
      // Tentative de récupération avec le backend réel
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error: any) {
      logError("Erreur récupération utilisateur:", error);
      
      if (isInDemoMode()) {
        return getDemoUser();
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
      // Pour le mode démo, simuler une inscription réussie
      if (userData.email.includes("demo") || userData.email.includes("test")) {
        return {
          id: 1,
          email: userData.email,
          full_name: userData.full_name,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      // Tentative d'inscription avec le backend réel
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error: any) {
      logError("Erreur inscription:", error);
      
      // Vérifier si l'erreur est due à un email déjà utilisé
      if (error.response?.status === 400 && error.response?.data?.detail?.includes("email")) {
        throw new Error("Cet email est déjà utilisé. Veuillez en choisir un autre.");
      }
      
      throw new Error("Échec de l'inscription - vérifiez les données saisies");
    }
  },

  logout: (): void => {
    localStorage.removeItem("spotbulle_token");
    localStorage.removeItem("spotbulle_refresh_token");
  }
};

// Service de profil avec gestion améliorée
export const profileService = {
  getMyProfile: async (): Promise<IProfile> => {
    try {
      const response = await apiClient.get("/profiles/me");
      return response.data;
    } catch (error: any) {
      logError("Erreur récupération profil:", error);
      
      if (isInDemoMode()) {
        // Retourner un profil fictif
        return getDemoProfile();
      }
      
      throw new Error("Impossible de récupérer votre profil. Veuillez réessayer plus tard.");
    }
  },

  updateProfile: async (data: Partial<ProfileData>): Promise<IProfile> => {
    try {
      const response = await apiClient.put("/profiles/me", data);
      return response.data;
    } catch (error: any) {
      logError("Erreur mise à jour profil:", error);
      
      if (isInDemoMode()) {
        // Simuler une mise à jour réussie
        const demoProfile = getDemoProfile();
        return {
          ...demoProfile,
          ...data,
          updated_at: new Date().toISOString()
        };
      }
      
      throw new Error("Impossible de mettre à jour votre profil. Veuillez réessayer plus tard.");
    }
  },

  uploadProfilePicture: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await apiClient.post("/profiles/me/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.profile_picture_url;
    } catch (error: any) {
      logError("Erreur upload photo:", error);
      
      if (isInDemoMode()) {
        // Simuler un upload réussi
        return URL.createObjectURL(file);
      }
      
      throw new Error("Impossible de télécharger votre photo de profil. Veuillez réessayer plus tard.");
    }
  }
};

// Service de matches
export const matchService = {
  getMatches: async (limit: number = 10): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/matches?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      logError("Erreur récupération des matches:", error);
      
      if (isInDemoMode()) {
        // Retourner des données de démo
        return getDemoMatches();
      }
      
      throw new Error("Impossible de récupérer les matches. Veuillez réessayer plus tard.");
    }
  }
};

// Service de transcription
export const transcriptionService = {
  transcribeAudio: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await apiClient.post("/transcription/audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 1 minute
      });
      
      return response.data.transcription;
    } catch (error: any) {
      logError("Erreur transcription:", error);
      
      if (isInDemoMode()) {
        // Simuler une transcription réussie
        return "Ceci est un exemple de transcription automatique générée à partir de votre fichier audio. Dans une implémentation réelle, ce texte serait le résultat d'un service de reconnaissance vocale comme Whisper d'OpenAI ou un autre service similaire.";
      }
      
      throw new Error("Impossible de transcrire l'audio. Veuillez réessayer plus tard.");
    }
  }
};

// Service vidéo
export const videoService = {
  processVideo: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await apiClient.post("/video/process", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000, // 2 minutes
      });
      
      return response.data.video_url;
    } catch (error: any) {
      logError("Erreur traitement vidéo:", error);
      
      if (isInDemoMode()) {
        // Simuler un traitement réussi
        return URL.createObjectURL(file);
      }
      
      throw new Error("Impossible de traiter la vidéo. Veuillez réessayer plus tard.");
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

