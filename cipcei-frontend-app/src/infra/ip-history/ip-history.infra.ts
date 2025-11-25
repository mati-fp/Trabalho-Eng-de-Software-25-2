import { api } from "@/lib/api";
import { FindIpHistoryParams } from "./ip-history.payloads";
import { IpHistory } from "@/types";

const findAllIpHistory = async (
  params?: FindIpHistoryParams
): Promise<IpHistory[]> => {
  const response = await api.get("/ip-history", { params });
  return response.data;
};

const findIpHistoryByCompany = async (
  companyId: string
): Promise<IpHistory[]> => {
  const response = await api.get(`/ip-history/company/${companyId}`);
  return response.data;
};

const findIpHistoryByIp = async (ipId: string): Promise<IpHistory[]> => {
  const response = await api.get(`/ip-history/ip/${ipId}`);
  return response.data;
};

const findIpHistoryByAddress = async (
  address: string
): Promise<IpHistory[]> => {
  const response = await api.get(`/ip-history/ip-address/${address}`);
  return response.data;
};

export const IpHistoryAPI = {
  findAllIpHistory,
  findIpHistoryByCompany,
  findIpHistoryByIp,
  findIpHistoryByAddress,
};

