/**
 * TypeScript type definitions
 * Add your custom types here as the project grows
 */

// User type matching the backend UserResponseDto
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "company";
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth response type matching the backend AuthResponseDto
export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "company";
    companyId?: string;
  };
}

// Company user type (nested in Company)
export interface CompanyUser {
  id: string;
  name: string;
  email: string;
}

// Company type matching the backend CompanyResponseDto
export interface Company {
  id: string;
  user: CompanyUser;
  roomId?: string;
  roomNumber?: number;
  createdAt: string;
  updatedAt: string;
}

// Room company user type (nested in RoomCompany)
export interface RoomCompanyUser {
  name: string;
}

// Room company type (nested in Room)
export interface RoomCompany {
  id: string;
  user: RoomCompanyUser;
  roomNumber: number;
}

// Room type matching the backend RoomResponseDto
export interface Room {
  id: string;
  number: number;
  companies?: RoomCompany[];
}

// Room summary type matching the backend RoomSummaryResponseDto
export interface RoomSummary {
  id: string;
  number: number;
  hasCompanies: boolean;
  companiesCount: number;
}

// IP room type (nested in IP)
export interface IpRoom {
  id: string;
  number: number;
}

// IP company user type (nested in IpCompany)
export interface IpCompanyUser {
  name: string;
}

// IP company type (nested in IP)
export interface IpCompany {
  id: string;
  user: IpCompanyUser;
}

// IP type matching the backend IpResponseDto
export interface IP {
  id: string;
  address: string;
  status: "available" | "in_use" | "expired";
  macAddress?: string;
  room?: IpRoom;
  company?: IpCompany;
  expiresAt?: string;
}

// IP Request types
export type IpRequestType = "new" | "renewal" | "cancellation";
export type IpRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

// IP Request user type (nested in IpRequest)
export interface IpRequestUser {
  id: string;
  name: string;
  email: string;
}

// IP Request company user type (nested in IpRequestCompany)
export interface IpRequestCompanyUser {
  name: string;
}

// IP Request company type (nested in IpRequest)
export interface IpRequestCompany {
  id: string;
  user: IpRequestCompanyUser;
  roomNumber?: number;
}

// IP Request IP type (nested in IpRequest)
export interface IpRequestIp {
  id: string;
  address: string;
}

// IP Request type matching the backend IpRequestResponseDto
export interface IpRequest {
  id: string;
  requestType: IpRequestType;
  status: IpRequestStatus;
  justification: string;
  rejectionReason?: string;
  requestDate: string;
  expirationDate?: string;
  macAddress?: string;
  requestedBy: IpRequestUser;
  company: IpRequestCompany;
  ip?: IpRequestIp;
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

// IP History IP type (nested in IpHistory)
export interface IpHistoryIp {
  id: string;
  address: string;
}

// IP History company user type (nested in IpHistoryCompany)
export interface IpHistoryCompanyUser {
  name: string;
}

// IP History company type (nested in IpHistory)
export interface IpHistoryCompany {
  id: string;
  user: IpHistoryCompanyUser;
}

// IP History performed by type (nested in IpHistory)
export interface IpHistoryPerformedBy {
  id: string;
  name: string;
  email: string;
}

// IP History type matching the backend IpHistoryResponseDto
export interface IpHistory {
  id: string;
  action: IpAction;
  performedAt: string;
  macAddress?: string;
  userName?: string;
  notes?: string;
  expirationDate?: string;
  ip: IpHistoryIp;
  company?: IpHistoryCompany;
  performedBy: IpHistoryPerformedBy;
}

