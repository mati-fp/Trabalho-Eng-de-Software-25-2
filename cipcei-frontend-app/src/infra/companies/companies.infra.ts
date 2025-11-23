import { api } from "@/lib/api";
import { CreateCompanyPayload, UpdateCompanyPayload } from "./companies.payloads";
import { Company } from "@/types";

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

export const CompaniesAPI = {
  findAllCompanies,
  createCompany,
  findCompanyById,
  updateCompany,
  deleteCompany,
};