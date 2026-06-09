/**
 * IP Requests API Payload Types
 * Request payloads for IP request-related API calls
 */

export type IpRequestType = "new" | "cancellation";

export interface CreateIpRequestPayload {
  requestType: IpRequestType;
  justification: string;
  macAddress?: string;
  userName?: string;
  ipId?: string;
}

export interface ApproveIpRequestPayload {
  ipId?: string;
  notes?: string;
}

export interface RejectIpRequestPayload {
  rejectionReason: string;
}

