import { api } from "@/lib/api";
import { LoginPayload } from "./auth.payloads";
import { AuthResponse } from "@/types";

const login = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const AuthAPI = {
  login,
};
