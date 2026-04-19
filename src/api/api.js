import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
// Vite uses VITE_ prefix for env variables, not REACT_APP_
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({ baseURL: API_BASE_URL });
const AUTH_STORAGE_KEY = "transactionbook_user";
const LEGACY_AUTH_STORAGE_KEY = "tb_user";

const getStoredAuth = () => {
  const current = localStorage.getItem(AUTH_STORAGE_KEY);
  if (current) return current;

  const legacy = localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
  if (legacy) {
    localStorage.setItem(AUTH_STORAGE_KEY, legacy);
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    return legacy;
  }

  return null;
};

API.interceptors.request.use((config) => {
  const raw = getStoredAuth();
  if (raw) {
    const { token } = JSON.parse(raw);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = String(error.response?.data?.message || "").toLowerCase();
    const isAuthError = status === 401 && (message.includes("token") || message.includes("authorized"));

    if (isAuthError) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;
