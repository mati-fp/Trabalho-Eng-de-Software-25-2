import { Room } from './entities/room.entity';
import { Company } from '../companies/entities/company.entity';
import { RoomResponseDto, RoomSummaryResponseDto } from './dto/room-response.dto';

/**
 * Converte uma entidade Room para RoomResponseDto
 */
export function toRoomResponseDto(room: Room): RoomResponseDto {
  return {
    id: room.id,
    number: room.number,
    companies: room.companies?.map(company => ({
      id: company.id,
      user: {
        name: company.user?.name,
      },
      roomNumber: room.number,
    })),
  };
}

/**
 * Converte uma lista de entities Room para lista de RoomResponseDto
 */
export function toRoomResponseDtoList(rooms: Room[]): RoomResponseDto[] {
  return rooms.map(toRoomResponseDto);
}

/**
 * Converte uma entidade Room para RoomSummaryResponseDto
 */
export function toRoomSummaryResponseDto(room: Room): RoomSummaryResponseDto {
  return {
    id: room.id,
    number: room.number,
    hasCompanies: room.companies?.length > 0,
    companiesCount: room.companies?.length ?? 0,
  };
}

/**
 * Converte uma lista de entities Room para lista de RoomSummaryResponseDto
 */
export function toRoomSummaryResponseDtoList(rooms: Room[]): RoomSummaryResponseDto[] {
  return rooms.map(toRoomSummaryResponseDto);
}

/**
 * Converte Company[] de uma sala para o formato esperado pelo DTO
 * Usado em GET /rooms/:id/companies
 */
export function toRoomCompaniesResponseDto(companies: Company[], roomNumber: number) {
  return companies.map(company => ({
    id: company.id,
    user: {
      name: company.user?.name,
    },
    roomNumber: roomNumber,
  }));
}