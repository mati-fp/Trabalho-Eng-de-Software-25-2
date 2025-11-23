import { api } from "@/lib/api";
import { CreateRoomPayload, BulkCreateIpPayload } from "./rooms.payloads";
import { Room, IP } from "@/types";


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
  createRoom,
  bulkCreateIps,
};

