import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { Room } from './entities/room.entity';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create({ number: createRoomDto.number });
    return this.roomRepository.save(room);
  }

  async findAll(): Promise<Room[]> {
    return this.roomRepository.find({
      relations: ['companies', 'companies.user'],
    });
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['companies', 'companies.user', 'ips'],
    });
    if (!room) {
      throw new NotFoundException(`Sala com ID "${id}" não encontrada`);
    }
    return room;
  }

  async getCompanies(roomId: string): Promise<Company[]> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['companies', 'companies.user'],
    });
    if (!room) {
      throw new NotFoundException(`Sala com ID "${roomId}" não encontrada`);
    }
    return room.companies;
  }

  async getSummary(): Promise<{ id: string; name: string; hasCompanies: boolean }[]> {
    const rooms = await this.roomRepository.find({
      relations: ['companies'],
      order: { number: 'ASC' },
    });

    return rooms.map((room) => ({
      id: room.id,
      name: `Sala ${room.number}`,
      hasCompanies: room.companies.length > 0,
    }));
  }
}