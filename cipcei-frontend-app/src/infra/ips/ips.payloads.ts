/**
 * IPs API Payload Types
 * Request payloads for IP-related API calls
 */

import { IpStatus } from "@/types";

export interface AssignIpPayload {
  macAddress: string;
  companyId: string;
}

export interface FindAllIpsParams {
  status?: IpStatus;
  companyName?: string;
  roomNumber?: number;
}

