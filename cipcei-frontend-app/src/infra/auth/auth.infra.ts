import { api } from "@/lib/api";
import { LoginPayload, RefreshTokenPayload } from "./auth.payloads";
import { AuthResponse } from "@/types";

const login = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

const refreshToken = async (
  payload: RefreshTokenPayload
): Promise<AuthResponse> => {
  const response = await api.post("/auth/refresh", { refresh_token: payload.refresh_token });
  return response.data;
};

const testAuth = async (): Promise<string> => {
  const response = await api.get("/auth");
  return response.data;
};

export const AuthAPI = {
  login,
  refreshToken,
  testAuth,
};
