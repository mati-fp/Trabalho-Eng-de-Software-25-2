"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoomsAPI } from "@/infra/rooms/rooms.infra";
import { Room } from "@/types";

interface RoomSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function RoomSelect({
  value,
  onValueChange,
  placeholder = "Selecione uma sala",
  disabled = false,
}: RoomSelectProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await RoomsAPI.findAllRooms();
        setRooms(data);
      } catch (err) {
        setError("Erro ao carregar salas");
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={true}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Carregando..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={true}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Erro ao carregar" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <div className="space-y-2">
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {rooms.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              Nenhuma sala encontrada
            </div>
          ) : (
            rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.number.toString()}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

