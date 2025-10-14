/**
 * TypeScript type definitions
 * Add your custom types here as the project grows
 */

// User type matching the backend User entity
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
}

// Auth response type
export interface AuthResponse {
  access_token: string;
  user: User;
}

// Company type
export interface Company {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Room type
export interface Room {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

// IP type
export interface IP {
  id: string;
  address: string;
  status: "available" | "in_use";
  macAddress?: string;
  room?: Room;
  createdAt: string;
  updatedAt: string;
}

