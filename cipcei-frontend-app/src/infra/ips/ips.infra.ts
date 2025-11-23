import { api } from "@/lib/api";
import { AssignIpPayload, FindAllIpsParams } from "./ips.payloads";
import { IP } from "@/types";

const findAllIps = async (
  params?: FindAllIpsParams
): Promise<IP[]> => {
  const response = await api.get("/ips", { params });
  return response.data;
};

const assignIp = async (
  id: string,
  payload: AssignIpPayload
): Promise<IP> => {
  const response = await api.patch(`/ips/${id}/assign`, payload);
  return response.data;
};

const unassignIp = async (id: string): Promise<IP> => {
  const response = await api.patch(`/ips/${id}/unassign`);
  return response.data;
};

export const IpsAPI = {
  findAllIps,
  assignIp,
  unassignIp,
};
