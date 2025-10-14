import axios from "axios";

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

// Request interceptor to add JWT token if available
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear token and redirect to login if needed
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        // window.location.href = "/login"; // Uncomment when login page exists
      }
    }
    return Promise.reject(error);
  }
);

// Helper functions for token management
export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

