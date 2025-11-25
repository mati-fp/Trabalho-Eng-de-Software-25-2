/**
 * TypeScript type definitions
 * Add your custom types here as the project grows
 */

// User type matching the backend User entity
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "company";
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth response type
export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

// Company type
export interface Company {
  id: string;
  user?: User;
  room?: Room;
  createdAt: string;
  updatedAt: string;
}

// Room type
export interface Room {
  id: string;
  number: number;
  company?: Company;
}

// IP type
export interface IP {
  id: string;
  address: string;
  status: "available" | "in_use" | "expired";
  macAddress?: string;
  userName?: string;
  isTemporary: boolean;
  assignedAt?: string;
  expiresAt?: string;
  lastRenewedAt?: string;
  room?: Room;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

// IP Request types
export type IpRequestType = "new" | "renewal" | "cancellation";
export type IpRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface IpRequest {
  id: string;
  company: Company;
  ip?: IP;
  requestType: IpRequestType;
  status: IpRequestStatus;
  requestedBy: User;
  approvedBy?: User;
  requestDate: string;
  responseDate?: string;
  expirationDate?: string;
  justification: string;
  rejectionReason?: string;
  macAddress?: string;
  userName?: string;
  isTemporary: boolean;
  updatedAt: string;
}

// IP History types
export type IpAction =
  | "assigned"
  | "released"
  | "renewed"
  | "cancelled"
  | "expired"
  | "requested"
  | "approved"
  | "rejected";

export interface IpHistory {
  id: string;
  ip: IP;
  company?: Company;
  action: IpAction;
  performedBy: User;
  performedAt: string;
  macAddress?: string;
  userName?: string;
  notes?: string;
  expirationDate?: string;
}

