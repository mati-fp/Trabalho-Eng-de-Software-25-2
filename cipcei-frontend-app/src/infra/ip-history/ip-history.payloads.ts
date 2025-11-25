/**
 * IP History API Payload Types
 * Request payloads for IP history-related API calls
 */

export type IpAction =
  | "assigned"
  | "released"
  | "renewed"
  | "cancelled"
  | "expired"
  | "requested"
  | "approved"
  | "rejected";

export interface FindIpHistoryParams {
  companyId?: string;
  ipId?: string;
  action?: IpAction;
  startDate?: string;
  endDate?: string;
}

