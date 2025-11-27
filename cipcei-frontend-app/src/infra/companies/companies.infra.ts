import { api } from "@/lib/api";
import { CreateCompanyPayload, UpdateCompanyPayload } from "./companies.payloads";
import { Company, IP } from "@/types";

const findAllCompanies = async (): Promise<Company[]> => {
  const response = await api.get("/companies");
  return response.data;
};

const createCompany = async (
  payload: CreateCompanyPayload
): Promise<Company> => {
  const response = await api.post("/companies", payload);
  return response.data;
};

const findCompanyById = async (id: string): Promise<Company> => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

const updateCompany = async (
  id: string,
  payload: UpdateCompanyPayload
): Promise<Company> => {
  const response = await api.patch(`/companies/${id}`, payload);
  return response.data;
};

const deleteCompany = async (id: string): Promise<void> => {
  await api.delete(`/companies/${id}`);
};

const getMyCompany = async (): Promise<Company> => {
  const response = await api.get("/companies/me");
  return response.data;
};

const getMyIps = async ({ type }: { type?: "active" | "renewable" }): Promise<IP[]> => {
  const response = await api.get(`/companies/me/ips${type ? type === "active" ? "/active" : "/renewable" : ""}`);
  return response.data;
};

const getCompanyIps = async (id: string): Promise<IP[]> => {
  const response = await api.get(`/companies/${id}/ips`);
  return response.data;
};

export const CompaniesAPI = {
  findAllCompanies,
  createCompany,
  findCompanyById,
  updateCompany,
  deleteCompany,
  getMyCompany,
  getMyIps,
  getCompanyIps,
};