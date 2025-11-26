import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { IpHistory, IpAction } from './entities/ip-history.entity';
import { Ip } from '../ips/entities/ip.entity';
import { Company } from '../companies/entities/company.entity';
import { User } from '../users/entities/user.entity';
import { FindIpHistoryDto } from './dto/find-ip-history.dto';
import { IpHistoryResponseDto } from './dto/ip-history-response.dto';
import { toIpHistoryResponseDtoList } from './ip-history.mapper';

@Injectable()
export class IpHistoryService {
  constructor(
    @InjectRepository(IpHistory)
    private ipHistoryRepository: Repository<IpHistory>,
  ) {}

  /**
   * Cria um novo registro no histórico de IPs
   * Nota: Este método retorna IpHistory pois é usado internamente por outros serviços
   */
  async create(data: {
    ip: Ip;
    company?: Company;
    action: IpAction;
    performedBy: User;
    macAddress?: string;
    userName?: string;
    notes?: string;
    expirationDate?: Date;
  }): Promise<IpHistory> {
    const history = this.ipHistoryRepository.create(data);
    return this.ipHistoryRepository.save(history);
  }

  /**
   * Busca histórico por IP
   */
  async findByIp(ipId: string): Promise<IpHistoryResponseDto[]> {
    const histories = await this.ipHistoryRepository.find({
      where: { ip: { id: ipId } },
      relations: ['ip', 'company', 'company.user', 'performedBy'],
      order: { performedAt: 'DESC' },
    });
    return toIpHistoryResponseDtoList(histories);
  }

  /**
   * Busca histórico por empresa
   * Este é o método principal para o Admin ver TODO o histórico de uma empresa
   */
  async findByCompany(companyId: string): Promise<IpHistoryResponseDto[]> {
    const histories = await this.ipHistoryRepository.find({
      where: { company: { id: companyId } },
      relations: ['ip', 'company', 'company.user', 'performedBy'],
      order: { performedAt: 'DESC' },
    });
    return toIpHistoryResponseDtoList(histories);
  }

  /**
   * Busca histórico com filtros
   */
  async findAll(filters: FindIpHistoryDto): Promise<IpHistoryResponseDto[]> {
    const where: any = {};

    if (filters.companyId) {
      where.company = { id: filters.companyId };
    }

    if (filters.ipId) {
      where.ip = { id: filters.ipId };
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.startDate && filters.endDate) {
      where.performedAt = Between(
        new Date(filters.startDate),
        new Date(filters.endDate),
      );
    } else if (filters.startDate) {
      where.performedAt = Between(
        new Date(filters.startDate),
        new Date('2100-12-31'),
      );
    } else if (filters.endDate) {
      where.performedAt = Between(
        new Date('1900-01-01'),
        new Date(filters.endDate),
      );
    }

    const histories = await this.ipHistoryRepository.find({
      where,
      relations: ['ip', 'company', 'company.user', 'performedBy'],
      order: { performedAt: 'DESC' },
    });
    return toIpHistoryResponseDtoList(histories);
  }

  /**
   * Busca histórico de um IP específico com informações detalhadas
   * Mostra todas as vezes que o IP foi usado, por quem, com qual MAC, etc.
   */
  async getIpDetailedHistory(ipAddress: string): Promise<IpHistoryResponseDto[]> {
    const histories = await this.ipHistoryRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.ip', 'ip')
      .leftJoinAndSelect('history.company', 'company')
      .leftJoinAndSelect('company.user', 'user')
      .leftJoinAndSelect('history.performedBy', 'performedBy')
      .where('ip.address = :ipAddress', { ipAddress })
      .orderBy('history.performedAt', 'DESC')
      .getMany();
    return toIpHistoryResponseDtoList(histories);
  }
}