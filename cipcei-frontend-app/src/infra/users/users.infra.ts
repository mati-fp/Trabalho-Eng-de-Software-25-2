import { api } from "@/lib/api";
import { CreateUserPayload } from "./users.payloads";
import { User } from "@/types";

const createUser = async (
  payload: CreateUserPayload
): Promise<User> => {
  const response = await api.post("/users", payload);
  return response.data;
};

const findAllUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

export const UsersAPI = {
  createUser,
  findAllUsers,
};
