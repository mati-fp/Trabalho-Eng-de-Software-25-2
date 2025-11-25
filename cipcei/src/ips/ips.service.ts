import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Ip, IpStatus } from "./entities/ip.entity";
import { Repository } from "typeorm";
import { Room } from "src/rooms/entities/room.entity";
import { CreateIpDto } from "./dto/create-ip.dto";
import { AssignIpDto } from "./dto/assign-ip.dto";
import { Company } from "src/companies/entities/company.entity";
import { FindAllIpsDto } from "./dto/find-all-ips.dto";

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
    const { status, companyName, roomNumber } = findAllIpsDto;

    const queryBuilder = this.ipRepository.createQueryBuilder('ip');

    queryBuilder
      .leftJoinAndSelect('ip.room', 'room')
      .leftJoinAndSelect('ip.company', 'company')
      .leftJoinAndSelect('company.user', 'user')
      .select([
        // Campos do IP
        'ip.id',
        'ip.address',
        'ip.status',
        'ip.macAddress',
        // Campos do Room
        'room.id',
        'room.number',
        // Campos da Company (atribuída ao IP)
        'company.id',
        // Campos do User
        'user.name',
        'user.isActive',
      ]);

    if (status) {
      queryBuilder.andWhere('ip.status = :status', { status });
    }

    if (companyName) {
      queryBuilder.andWhere('LOWER(user.name) LIKE LOWER(:companyName)', {
        companyName: `%${companyName}%`,
      });
    }

    if (roomNumber) {
      queryBuilder.andWhere('room.number = :roomNumber', { roomNumber });
    }

    return queryBuilder.getMany();
  }

  async bulkCreate(roomId: string, createIpDtos: CreateIpDto[]): Promise<Ip[]> {
    const room = await this.roomRepository.findOneBy({ id: roomId });
    if (!room) {
      throw new NotFoundException(`Sala com ID "${roomId}" nao encontrada`);
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
      throw new NotFoundException(`IP com ID "${ipId}" nao encontrado`);
    }

    // 2. Verifica se o IP esta disponivel
    if (ip.status === IpStatus.IN_USE) {
      throw new ConflictException(`Endereco IP ${ip.address} ja esta em uso`);
    }

    // 3. Encontra a empresa e sua sala
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['room'],
    });
    if (!company) {
      throw new NotFoundException(`Empresa com ID "${companyId}" nao encontrada`);
    }

    // 4. Valida se a sala do IP e da empresa sao a mesma
    if (!ip.room || !company.room || ip.room.id !== company.room.id) {
      throw new BadRequestException('Endereco IP nao pertence a sala da empresa');
    }

    // 5. Atualiza e salva o IP
    ip.status = IpStatus.IN_USE;
    ip.macAddress = macAddress;
    ip.company = company;
    ip.assignedAt = new Date();

    return this.ipRepository.save(ip);
  }

  async unassign(ipId: string): Promise<Ip> {
    const ip = await this.ipRepository.findOneBy({ id: ipId });
    if (!ip) {
      throw new NotFoundException(`IP com ID "${ipId}" nao encontrado`);
    }

    if (ip.status === IpStatus.AVAILABLE) {
      throw new ConflictException(`Endereco IP ${ip.address} ja esta disponivel`);
    }

    ip.status = IpStatus.AVAILABLE;
    ip.macAddress = undefined as any;
    ip.company = undefined as any;
    ip.assignedAt = undefined as any;
    ip.expiresAt = undefined as any;
    ip.isTemporary = false;

    return this.ipRepository.save(ip);
  }
}