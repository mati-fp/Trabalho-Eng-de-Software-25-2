/**
 * Users API Payload Types
 * Request payloads for user-related API calls
 */

export interface CreateUserPayload {
  email: string;
  name: string;
  password: string;
  role?: "admin" | "company";
}

