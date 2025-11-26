import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AuthAPI } from "@/infra/auth";

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

export const refreshApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          // No refresh token, clear tokens and redirect to login
          localStorage.removeItem("auth_token");
          localStorage.removeItem("refresh_token");
          isRefreshing = false;
          processQueue(error, null);
          window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          // Try to refresh the token
          const response = await refreshApi.post("/auth/refresh", { refresh_token: refreshToken });
          // Update tokens
          localStorage.setItem("auth_token", response.data.access_token);
          if (response.data.refresh_token) {
            localStorage.setItem("refresh_token", response.data.refresh_token);
          }

          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          }

          isRefreshing = false;
          processQueue(null, response.data.access_token);

          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login for ANY error
          localStorage.removeItem("auth_token");
          localStorage.removeItem("refresh_token");
          isRefreshing = false;
          processQueue(refreshError as AxiosError, null);

          // Redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          return Promise.reject(refreshError);
        }
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

