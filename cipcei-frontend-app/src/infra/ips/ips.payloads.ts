/**
 * IPs API Payload Types
 * Request payloads for IP-related API calls
 */

export interface AssignIpPayload {
  macAddress: string;
  companyId: string;
}

export interface FindAllIpsParams {
  status?: "available" | "in_use" | "expired";
  companyName?: string;
  roomNumber?: number;
}

