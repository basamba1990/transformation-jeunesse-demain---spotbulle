// frontend/src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('spotbulle_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export interface IUser {
  id: number;
  email: string;
  full_name: string;
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
  interests: string[];
  skills: string[];
  objectives: string | null;
  created_at: string;
  updated_at: string;
}

export const authService = {
  login: (credentials: URLSearchParams) => apiClient.post('/auth/token', credentials, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  register: (userData: Omit<IUser, 'id' | 'created_at' | 'updated_at'>) => 
    apiClient.post('/auth/register', userData),
  getCurrentUser: (): Promise<IUser> => apiClient.get('/auth/users/me').then(res => res.data),
  logout: () => {
    localStorage.removeItem('spotbulle_token');
  }
};

export const podService = {
  create: (data: FormData): Promise<IPod> => apiClient.post('/pods/', data).then(res => res.data),
  getAll: (): Promise<IPod[]> => apiClient.get('/pods/').then(res => res.data),
  getMine: (): Promise<IPod[]> => apiClient.get('/pods/mine').then(res => res.data),
  getById: (id: number): Promise<IPod> => apiClient.get(`/pods/${id}`).then(res => res.data),
  update: (id: number, data: FormData): Promise<IPod> => 
    apiClient.put(`/pods/${id}`, data).then(res => res.data),
  delete: (id: number): Promise<void> => apiClient.delete(`/pods/${id}`),
  transcribe: (id: number): Promise<IPod> => 
    apiClient.post(`/pods/${id}/transcribe`).then(res => res.data)
};

export const profileService = {
  getMyProfile: (): Promise<IProfile> => apiClient.get('/profiles/me').then(res => res.data),
  updateProfile: (data: Partial<IProfile>): Promise<IProfile> => 
    apiClient.put('/profiles/me', data).then(res => res.data)
};

export const discService = {
  getQuestionnaire: (): Promise<DISCQuestion[]> => 
    apiClient.get('/profiles/disc/questionnaire').then(res => res.data),
  submitAssessment: (data: DISCAssessmentRequest): Promise<DISCResults> => 
    apiClient.post('/profiles/disc/assess', data).then(res => res.data),
  getResults: (): Promise<DISCResults> => 
    apiClient.get('/profiles/disc/results').then(res => res.data)
};

export const aiService = {
  getMatches: (limit = 10): Promise<IAMatch[]> => 
    apiClient.get(`/ia/matches?limit=${limit}`).then(res => res.data),
  chatWithBot: (prompt: string): Promise<IABotResponse> => 
    apiClient.post('/ia/bot/chat', { prompt }).then(res => res.data)
};

export default apiClient;
