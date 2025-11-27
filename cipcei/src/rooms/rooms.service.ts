import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { Room } from './entities/room.entity';
import { RoomResponseDto, RoomSummaryResponseDto, RoomCompanyDto } from './dto/room-response.dto';
import { toRoomResponseDto, toRoomResponseDtoList, toRoomSummaryResponseDtoList, toRoomCompaniesResponseDto } from './rooms.mapper';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<RoomResponseDto> {
    const room = this.roomRepository.create({ number: createRoomDto.number });
    const savedRoom = await this.roomRepository.save(room);
    // Buscar com relacoes para o DTO
    const roomWithRelations = await this.roomRepository.findOne({
      where: { id: savedRoom.id },
      relations: ['companies', 'companies.user'],
    });
    return toRoomResponseDto(roomWithRelations!);
  }

  async findAll(): Promise<RoomResponseDto[]> {
    const rooms = await this.roomRepository.find({
      relations: ['companies', 'companies.user'],
    });
    return toRoomResponseDtoList(rooms);
  }

  async findOne(id: string): Promise<RoomResponseDto> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['companies', 'companies.user', 'ips'],
    });
    if (!room) {
      throw new NotFoundException(`Sala com ID "${id}" não encontrada`);
    }
    return toRoomResponseDto(room);
  }

  async getCompanies(roomId: string): Promise<RoomCompanyDto[]> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['companies', 'companies.user'],
    });
    if (!room) {
      throw new NotFoundException(`Sala com ID "${roomId}" não encontrada`);
    }
    return toRoomCompaniesResponseDto(room.companies, room.number);
  }

  async getSummary(): Promise<RoomSummaryResponseDto[]> {
    const rooms = await this.roomRepository.find({
      relations: ['companies'],
      order: { number: 'ASC' },
    });
    return toRoomSummaryResponseDtoList(rooms);
  }
}