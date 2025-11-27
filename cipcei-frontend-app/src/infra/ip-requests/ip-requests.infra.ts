import { api } from "@/lib/api";
import {
  CreateIpRequestPayload,
  ApproveIpRequestPayload,
  RejectIpRequestPayload,
} from "./ip-requests.payloads";
import { IpRequest } from "@/types";

const createIpRequest = async (
  payload: CreateIpRequestPayload
): Promise<IpRequest> => {
  const response = await api.post("/ip-requests", payload);
  return response.data;
};

const findAllIpRequests = async (): Promise<IpRequest[]> => {
  const response = await api.get("/ip-requests");
  return response.data;
};

const findMyIpRequests = async (): Promise<IpRequest[]> => {
  const response = await api.get("/ip-requests/my-requests");
  return response.data;
};

const findPendingIpRequests = async (): Promise<IpRequest[]> => {
  const response = await api.get("/ip-requests/pending");
  return response.data;
};

const findIpRequestsByCompany = async (
  companyId: string
): Promise<IpRequest[]> => {
  const response = await api.get(`/ip-requests/company/${companyId}`);
  return response.data;
};

const findIpRequestById = async (id: string): Promise<IpRequest> => {
  const response = await api.get(`/ip-requests/${id}`);
  return response.data;
};

const cancelIpRequest = async (id: string): Promise<IpRequest> => {
  const response = await api.patch(`/ip-requests/${id}/cancel`);
  return response.data;
};

const approveIpRequest = async (
  id: string,
  payload: ApproveIpRequestPayload
): Promise<IpRequest> => {
  const response = await api.patch(`/ip-requests/${id}/approve`, payload);
  return response.data;
};

const rejectIpRequest = async (
  id: string,
  payload: RejectIpRequestPayload
): Promise<IpRequest> => {
  const response = await api.patch(`/ip-requests/${id}/reject`, payload);
  return response.data;
};

export const IpRequestsAPI = {
  createIpRequest,
  findAllIpRequests,
  findMyIpRequests,
  findPendingIpRequests,
  findIpRequestsByCompany,
  findIpRequestById,
  cancelIpRequest,
  approveIpRequest,
  rejectIpRequest,
};

