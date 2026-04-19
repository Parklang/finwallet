// ============================================================
// API CLIENT — Axios Instance
// ============================================================
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Typed API helpers
export const api = {
  get: <T>(url: string, params?: any) =>
    apiClient.get<T>(url, { params }).then(r => r.data),
  post: <T>(url: string, data?: any, config?: any) =>
    apiClient.post<T>(url, data, config).then(r => r.data),
  put: <T>(url: string, data?: any, config?: any) =>
    apiClient.put<T>(url, data, config).then(r => r.data),
  delete: <T>(url: string) =>
    apiClient.delete<T>(url).then(r => r.data),
};
