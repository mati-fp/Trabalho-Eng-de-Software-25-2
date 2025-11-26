import { api } from "@/lib/api";
import { CreateRoomPayload, BulkCreateIpPayload } from "./rooms.payloads";
import { Room, IP, Company, RoomSummary } from "@/types";

const findAllRooms = async (): Promise<Room[]> => {
  const response = await api.get("/rooms");
  return response.data;
};

const getRoomsSummary = async (): Promise<RoomSummary[]> => {
  const response = await api.get("/rooms/summary");
  return response.data;
};

const findRoomById = async (id: string): Promise<Room> => {
  const response = await api.get(`/rooms/${id}`);
  return response.data;
};

const getRoomCompanies = async (roomId: string): Promise<Company[]> => {
  const response = await api.get(`/rooms/${roomId}/companies`);
  return response.data;
};

const createRoom = async (
  payload: CreateRoomPayload
): Promise<Room> => {
  const response = await api.post("/rooms", payload);
  return response.data;
};

const bulkCreateIps = async (
  roomId: string,
  payload: BulkCreateIpPayload
): Promise<IP[]> => {
  const response = await api.post(`/rooms/${roomId}/ips`, payload);
  return response.data;
};

export const RoomsAPI = {
  findAllRooms,
  getRoomsSummary,
  findRoomById,
  getRoomCompanies,
  createRoom,
  bulkCreateIps,
};

