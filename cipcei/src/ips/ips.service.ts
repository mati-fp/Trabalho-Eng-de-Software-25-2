import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Ip, IpStatus } from "./entities/ip.entity";
import { Repository } from "typeorm";
import { Room } from "src/rooms/entities/room.entity";
import { CreateIpDto } from "./dto/create-ip.dto";
import { AssignIpDto } from "./dto/assign-ip.dto";
import { Company } from "src/companies/entities/company.entity";
import { FindAllIpsDto } from "./dto/find-all-ips.dto";
import { isUUID } from 'class-validator';

@Injectable()
export class IpsService {
  constructor(
    @InjectRepository(Ip)
    private readonly ipRepository: Repository<Ip>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async findAll(findAllIpsDto: FindAllIpsDto): Promise<Ip[]> {
    // --- ALTERAÇÃO AQUI ---
    const { status, companyId, roomNumber } = findAllIpsDto;

    const queryBuilder = this.ipRepository.createQueryBuilder('ip');

    queryBuilder
     .leftJoinAndSelect('ip.room', 'room')
     .leftJoinAndSelect('room.company', 'company');

    if (status) {
      queryBuilder.andWhere('ip.status = :status', { status });
    }

    if (companyId) {
      queryBuilder.andWhere('company.id = :companyId', { companyId });
    }

    // --- ALTERAÇÃO AQUI ---
    // Adiciona a condição para o novo filtro de número da sala
    if (roomNumber) {
      queryBuilder.andWhere('room.number = :roomNumber', { roomNumber });
    }

    return queryBuilder.getMany();
  }

  async bulkCreate(roomId: string, createIpDtos: CreateIpDto[]): Promise<Ip[]> {
    const room = await this.roomRepository.findOneBy({ id: roomId });
    if (!room) {
      throw new NotFoundException(`Room with ID "${roomId}" not found`);
    }

    const ipsToSave = createIpDtos.map((dto) =>
      this.ipRepository.create({
        address: dto.address,
        room: room,
      }),
    );

    return this.ipRepository.save(ipsToSave);
  }

  async assign(ipId: string, assignIpDto: AssignIpDto): Promise<Ip> {
    const { macAddress, companyId } = assignIpDto;

    // 1. Encontra o IP e sua sala
    const ip = await this.ipRepository.findOne({
      where: { id: ipId },
      relations: ['room'],
    });
    if (!ip) {
      throw new NotFoundException(`IP with ID "${ipId}" not found`);
    }

    // 2. Verifica se o IP está disponível
    if (ip.status === IpStatus.IN_USE) {
      throw new ConflictException(`IP address ${ip.address} is already in use`);
    }

    // 3. Encontra a empresa e sua sala
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['room'],
    });
    if (!company) {
      throw new NotFoundException(`Company with ID "${companyId}" not found`);
    }

    // 4. Valida se a sala do IP e da empresa são a mesma
    if (!ip.room || !company.room || ip.room.id !== company.room.id) {
      throw new BadRequestException('IP address does not belong to the company\'s room');
    }

    // 5. Atualiza e salva o IP
    ip.status = IpStatus.IN_USE;
    ip.macAddress = macAddress;

    return this.ipRepository.save(ip);
  }

  async unassign(ipId: string): Promise<Ip> {
    const ip = await this.ipRepository.findOneBy({ id: ipId });
    if (!ip) {
      throw new NotFoundException(`IP with ID "${ipId}" not found`);
    }
    
    if (ip.status === IpStatus.AVAILABLE) {
      throw new ConflictException(`IP address ${ip.address} is already available`);
    }
    ip.status = IpStatus.AVAILABLE;
    ip.macAddress = '';
    
    return this.ipRepository.save(ip);
  }

  async requestIp(companyId: string, roomId: string) {
    if (!isUUID(roomId)) {
      throw new BadRequestException('roomId deve ser um UUID válido');
    }
    // Busca um IP disponível na sala
    const ip = await this.ipRepository.findOne({
      where: { room: { id: roomId }, status: IpStatus.AVAILABLE },
      relations: ['room'],
    });
    if (!ip) {
      throw new NotFoundException('Nenhum IP disponível nesta sala');
    }

    // Atualiza o status para IN_USE
    ip.status = IpStatus.IN_USE;
    await this.ipRepository.save(ip);
    return ip;
  }
}