/**
 * IPs Infrastructure
 * API client functions for IP-related operations
 */

import { api } from "@/lib/api";
import { AssignIpPayload, FindAllIpsParams } from "./ips.payloads";
import { IP } from "@/types";


/**
 * Get all IPs with optional filters
 * GET /ips
 * @param params - Optional query parameters (status, companyId, roomNumber)
 * @returns Promise with array of IPs
 */
export const findAllIps = async (
  params?: FindAllIpsParams
): Promise<IP[]> => {
  const response = await api.get("/ips", { params });
  return response.data;
};

/**
 * Assign an IP to a company with MAC address
 * PATCH /ips/:id/assign
 * @param id - IP ID
 * @param payload - AssignIpPayload with macAddress and companyId
 * @returns Promise with updated IP
 */
export const assignIp = async (
  id: string,
  payload: AssignIpPayload
): Promise<IP> => {
  const response = await api.patch(`/ips/${id}/assign`, payload);
  return response.data;
};

/**
 * Unassign an IP (make it available again)
 * PATCH /ips/:id/unassign
 * @param id - IP ID
 * @returns Promise with updated IP
 */
export const unassignIp = async (id: string): Promise<IP> => {
  const response = await api.patch(`/ips/${id}/unassign`);
  return response.data;
};

