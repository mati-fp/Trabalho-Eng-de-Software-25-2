/**
 * Auth API Payload Types
 * Request payloads for authentication-related API calls
 */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

