// mobile/src/services/api.ts
// Single axios instance — same Django backend endpoints as frontend
// Replaces: whatever fetch/axios setup you had in frontend

import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY } from "../store/authStore";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://django-react-ml-app.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────
// Automatically attaches token to every request (replaces manual token headers)
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────
// Handles 401 globally — token expired or invalid
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear stored auth — user will be redirected by navigation guard
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

// ─── Auth Endpoints ────────────────────────────────────────────────────────
export const authAPI = {
  login: (username: string, password: string) =>
    api.post("/api/auth/login/", { username, password }),

  signup: (data: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => api.post("/api/auth/register/", data),

  logout: () => api.post("/api/auth/logout/"),

  getProfile: () => api.get("/api/auth/user/"),
};

// ─── ML / CV Endpoints ─────────────────────────────────────────────────────
export const mlAPI = {
  predict: (formData: FormData) =>
    api.post("/api/ml/predict/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ─── Employees Endpoints ───────────────────────────────────────────────────
export const employeesAPI = {
  getAll: () => api.get("/api/employees/"),
  getOne: (id: number) => api.get(`/api/employees/${id}/`),
  create: (data: object) => api.post("/api/employees/", data),
  update: (id: number, data: object) => api.put(`/api/employees/${id}/`, data),
  delete: (id: number) => api.delete(`/api/employees/${id}/`),
};

// ─── Syllabus Endpoints ────────────────────────────────────────────────────
export const syllabusAPI = {
  getAll: () => api.get("/api/syllabus/"),
};

// ─── Trainer KPI Endpoints ─────────────────────────────────────────────────
export const trainerAPI = {
  getKPIs: () => api.get("/api/trainer/kpi/"),
};

// ─── Mnemonic Endpoints ────────────────────────────────────────────────────
export const mnemonicAPI = {
  generate: (topic: string) => api.post("/api/mnemonic/generate/", { topic }),
};

export default api;