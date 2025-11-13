import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Ip, IpStatus } from "./entities/ip.entity";
import { Repository } from "typeorm";
import { Room } from "src/rooms/entities/room.entity";
import { CreateIpDto } from "./dto/create-ip.dto";
import { AssignIpDto } from "./dto/assign-ip.dto";
import { Company } from "src/companies/entities/company.entity";
import { FindAllIpsDto } from "./dto/find-all-ips.dto";
import { MensageriaService } from '../mensageria/mensageria.service';

@Injectable()
export class IpsService {
  constructor(
    @InjectRepository(Ip)
    private readonly ipRepository: Repository<Ip>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly mensageriaService: MensageriaService,
  ) {}

  async findAll(findAllIpsDto: FindAllIpsDto): Promise<Ip[]> {

    const { status, companyName, roomNumber } = findAllIpsDto;

    const queryBuilder = this.ipRepository.createQueryBuilder('ip');

    queryBuilder
     .leftJoinAndSelect('ip.room', 'room')
     .leftJoinAndSelect('room.company', 'company')
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
        // Campos da Company
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
        companyName: `%${companyName}%` 
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

    const saved = await this.ipRepository.save(ip);

    // UC10: envio de email (ignora falha)
    try {
      await this.mensageriaService.sendIpLiberado(company.id, saved.id);
    } catch (e) {}

    return saved;
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

    const saved = await this.ipRepository.save(ip);

    // Encontrar empresa ligada à sala para notificar (se existir)
    const company = await this.companyRepository.findOne({
      where: { room: { id: ip.room?.id } },
      relations: ['room', 'user'],
    });

    if (company) {
      // UC11: envio de email
      try {
        await this.mensageriaService.sendIpCancelado(company.id, saved.id);
      } catch (e) {}
    }

    return saved;
  }
}