/**
 * Rooms API Payload Types
 * Request payloads for room-related API calls
 */

export interface CreateRoomPayload {
  number: number;
}

export interface CreateIpPayload {
  address: string;
}

export interface BulkCreateIpPayload {
  ips: CreateIpPayload[];
}

