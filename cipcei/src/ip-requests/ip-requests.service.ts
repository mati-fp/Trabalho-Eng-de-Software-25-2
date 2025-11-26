import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IpRequest, IpRequestStatus, IpRequestType } from './entities/ip-request.entity';
import { Ip, IpStatus } from '../ips/entities/ip.entity';
import { Company } from '../companies/entities/company.entity';
import { User } from '../users/entities/user.entity';
import { IpHistoryService } from '../ip-history/ip-history.service';
import { IpAction } from '../ip-history/entities/ip-history.entity';
import { CreateIpRequestDto } from './dto/create-ip-request.dto';
import { ApproveIpRequestDto } from './dto/approve-ip-request.dto';
import { RejectIpRequestDto } from './dto/reject-ip-request.dto';
import { IpRequestResponseDto } from './dto/ip-request-response.dto';
import { toIpRequestResponseDto, toIpRequestResponseDtoList } from './ip-requests.mapper';

@Injectable()
export class IpRequestsService {
  constructor(
    @InjectRepository(IpRequest)
    private ipRequestRepository: Repository<IpRequest>,
    @InjectRepository(Ip)
    private ipRepository: Repository<Ip>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private ipHistoryService: IpHistoryService,
    private dataSource: DataSource,
  ) {}

  /**
   * UC3: Empresa solicita novo IP
   */
  async create(
    createIpRequestDto: CreateIpRequestDto,
    user: User,
  ): Promise<IpRequestResponseDto> {
    // Verificar se o usuário tem uma empresa associada
    if (!user.company) {
      throw new UnauthorizedException('Usuário não possui empresa associada');
    }

    const company = await this.companyRepository.findOne({
      where: { id: user.company.id },
      relations: ['room', 'user'],
    });

    if (!company || !company.room) {
      throw new BadRequestException('Empresa não possui sala associada');
    }

    // Se for renovação ou cancelamento, precisa do IP
    if (
      (createIpRequestDto.requestType === IpRequestType.RENEWAL ||
        createIpRequestDto.requestType === IpRequestType.CANCELLATION) &&
      !createIpRequestDto.ipId
    ) {
      throw new BadRequestException(
        'ID do IP é obrigatório para renovação ou cancelamento',
      );
    }

    let ip: Ip | null = null;
    if (createIpRequestDto.ipId) {
      ip = await this.ipRepository.findOne({
        where: { id: createIpRequestDto.ipId },
        relations: ['company'],
      });

      if (!ip) {
        throw new NotFoundException('IP não encontrado');
      }

      // Verificar se o IP pertence à empresa
      if (!ip.company || ip.company.id !== company.id) {
        throw new UnauthorizedException('Este IP não pertence à sua empresa');
      }
    }

    const request = this.ipRequestRepository.create({
      company,
      ip: ip || undefined,
      requestType: createIpRequestDto.requestType,
      requestedBy: user,
      justification: createIpRequestDto.justification,
      macAddress: createIpRequestDto.macAddress,
      userName: createIpRequestDto.userName,
      isTemporary: createIpRequestDto.isTemporary || false,
      expirationDate: createIpRequestDto.expirationDate
        ? new Date(createIpRequestDto.expirationDate)
        : undefined,
    });

    const savedRequest = await this.ipRequestRepository.save(request);

    // Registrar no histórico
    if (ip) {
      await this.ipHistoryService.create({
        ip,
        company,
        action: IpAction.REQUESTED,
        performedBy: user,
        notes: `Solicitação: ${createIpRequestDto.requestType}`,
      });
    }

    // Buscar com relacoes para o DTO
    const requestWithRelations = await this.ipRequestRepository.findOne({
      where: { id: savedRequest.id },
      relations: ['company', 'company.user', 'company.room', 'ip', 'requestedBy'],
    });
    return toIpRequestResponseDto(requestWithRelations!);
  }

  /**
   * Admin aprova solicitação de IP
   */
  async approve(
    requestId: string,
    approveDto: ApproveIpRequestDto,
    admin: User,
  ): Promise<IpRequestResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = await this.ipRequestRepository.findOne({
        where: { id: requestId },
        relations: ['company', 'ip', 'requestedBy'],
      });

      if (!request) {
        throw new NotFoundException('Solicitação não encontrada');
      }

      if (request.status !== IpRequestStatus.PENDING) {
        throw new BadRequestException('Solicitação já foi processada');
      }

      // Buscar a company com a relacao room explicitamente
      // (necessario porque o eager loading da company nao carrega relacoes aninhadas)
      const companyWithRoom = await this.companyRepository.findOne({
        where: { id: request.company.id },
        relations: ['room', 'user'],
      });

      if (!companyWithRoom || !companyWithRoom.room) {
        throw new BadRequestException('Empresa não possui sala associada');
      }

      // Atualizar a company do request com a versao que tem room
      request.company = companyWithRoom;

      let ip: Ip;

      // Processar de acordo com o tipo de solicitação
      switch (request.requestType) {
        case IpRequestType.NEW:
          // Atribuir um IP disponível
          let ipFound: Ip | null;
          if (approveDto.ipId) {
            ipFound = await this.ipRepository.findOne({
              where: { id: approveDto.ipId },
              relations: ['room'],
            });
          } else {
            // Buscar automaticamente um IP disponível na sala da empresa
            ipFound = await this.ipRepository.findOne({
              where: {
                room: { id: request.company.room.id },
                status: IpStatus.AVAILABLE,
              },
            });
          }

          if (!ipFound) {
            throw new NotFoundException('Nenhum IP disponível encontrado');
          }

          ip = ipFound;

          if (ip.status !== IpStatus.AVAILABLE) {
            throw new BadRequestException('IP não está disponível');
          }

          // Atualizar o IP
          ip.status = IpStatus.IN_USE;
          ip.company = request.company;
          ip.macAddress = request.macAddress;
          ip.userName = request.userName;
          ip.isTemporary = request.isTemporary;
          ip.assignedAt = new Date();
          ip.expiresAt = request.expirationDate;
          await queryRunner.manager.save(ip);

          request.ip = ip;

          // Registrar no histórico
          await this.ipHistoryService.create({
            ip,
            company: request.company,
            action: IpAction.ASSIGNED,
            performedBy: admin,
            macAddress: request.macAddress,
            userName: request.userName,
            expirationDate: request.expirationDate,
            notes: approveDto.notes,
          });
          break;

        case IpRequestType.RENEWAL:
          if (!request.ip) {
            throw new BadRequestException('IP não encontrado na solicitação');
          }

          ip = request.ip;

          // Renovar o IP
          ip.expiresAt = request.expirationDate;
          ip.lastRenewedAt = new Date();
          ip.status = IpStatus.IN_USE;
          await queryRunner.manager.save(ip);

          // Registrar no histórico
          await this.ipHistoryService.create({
            ip,
            company: request.company,
            action: IpAction.RENEWED,
            performedBy: admin,
            expirationDate: request.expirationDate,
            notes: approveDto.notes,
          });
          break;

        case IpRequestType.CANCELLATION:
          if (!request.ip) {
            throw new BadRequestException('IP não encontrado na solicitação');
          }

          ip = request.ip;

          // Cancelar/Liberar o IP
          ip.status = IpStatus.AVAILABLE;
          ip.company = undefined as any;
          ip.macAddress = undefined as any;
          ip.userName = undefined as any;
          ip.assignedAt = undefined as any;
          ip.expiresAt = undefined as any;
          ip.isTemporary = false;
          await queryRunner.manager.save(ip);

          // Registrar no histórico
          await this.ipHistoryService.create({
            ip,
            company: request.company,
            action: IpAction.CANCELLED,
            performedBy: admin,
            notes: approveDto.notes,
          });
          break;
      }

      // Atualizar o request
      request.status = IpRequestStatus.APPROVED;
      request.approvedBy = admin;
      request.responseDate = new Date();
      const savedRequest = await queryRunner.manager.save(request);

      // Registrar aprovação no histórico (com MAC e username da solicitação)
      if (request.ip) {
        await this.ipHistoryService.create({
          ip: request.ip,
          company: request.company,
          action: IpAction.APPROVED,
          performedBy: admin,
          macAddress: request.macAddress,
          userName: request.userName,
          expirationDate: request.expirationDate,
          notes: `Solicitação aprovada: ${request.requestType}`,
        });
      }

      await queryRunner.commitTransaction();

      // Buscar com relacoes para o DTO
      const requestWithRelations = await this.ipRequestRepository.findOne({
        where: { id: savedRequest.id },
        relations: ['company', 'company.user', 'company.room', 'ip', 'requestedBy'],
      });
      return toIpRequestResponseDto(requestWithRelations!);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Admin rejeita solicitação
   */
  async reject(
    requestId: string,
    rejectDto: RejectIpRequestDto,
    admin: User,
  ): Promise<IpRequestResponseDto> {
    const request = await this.ipRequestRepository.findOne({
      where: { id: requestId },
      relations: ['company', 'ip'],
    });

    if (!request) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    if (request.status !== IpRequestStatus.PENDING) {
      throw new BadRequestException('Solicitação já foi processada');
    }

    request.status = IpRequestStatus.REJECTED;
    request.approvedBy = admin;
    request.responseDate = new Date();
    request.rejectionReason = rejectDto.rejectionReason;

    const savedRequest = await this.ipRequestRepository.save(request);

    // Registrar no histórico se houver IP associado
    if (request.ip) {
      await this.ipHistoryService.create({
        ip: request.ip,
        company: request.company,
        action: IpAction.REJECTED,
        performedBy: admin,
        notes: `Solicitação rejeitada: ${rejectDto.rejectionReason}`,
      });
    }

    // Buscar com relacoes para o DTO
    const requestWithRelations = await this.ipRequestRepository.findOne({
      where: { id: savedRequest.id },
      relations: ['company', 'company.user', 'company.room', 'ip', 'requestedBy'],
    });
    return toIpRequestResponseDto(requestWithRelations!);
  }

  /**
   * Empresa cancela sua própria solicitação pendente
   */
  async cancel(requestId: string, user: User): Promise<IpRequestResponseDto> {
    const request = await this.ipRequestRepository.findOne({
      where: { id: requestId },
      relations: ['company', 'requestedBy'],
    });

    if (!request) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    // Verificar se a solicitação pertence à empresa do usuário
    if (!user.company || request.company.id !== user.company.id) {
      throw new UnauthorizedException('Você não pode cancelar esta solicitação');
    }

    if (request.status !== IpRequestStatus.PENDING) {
      throw new BadRequestException('Apenas solicitações pendentes podem ser canceladas');
    }

    request.status = IpRequestStatus.CANCELLED;
    request.responseDate = new Date();

    const savedRequest = await this.ipRequestRepository.save(request);

    // Buscar com relacoes para o DTO
    const requestWithRelations = await this.ipRequestRepository.findOne({
      where: { id: savedRequest.id },
      relations: ['company', 'company.user', 'company.room', 'ip', 'requestedBy'],
    });
    return toIpRequestResponseDto(requestWithRelations!);
  }

  /**
   * Listar todas as solicitações (Admin)
   */
  async findAll(): Promise<IpRequestResponseDto[]> {
    const requests = await this.ipRequestRepository.find({
      relations: ['company', 'company.user', 'company.room', 'ip', 'requestedBy'],
      order: { requestDate: 'DESC' },
    });
    return toIpRequestResponseDtoList(requests);
  }

  /**
   * Listar solicitações pendentes (Admin)
   */
  async findPending(): Promise<IpRequestResponseDto[]> {
    const requests = await this.ipRequestRepository.find({
      where: { status: IpRequestStatus.PENDING },
      relations: ['company', 'company.user', 'company.room', 'ip', 'requestedBy'],
      order: { requestDate: 'ASC' },
    });
    return toIpRequestResponseDtoList(requests);
  }

  /**
   * Listar solicitações de uma empresa (Company ou Admin)
   */
  async findByCompany(companyId: string): Promise<IpRequestResponseDto[]> {
    const requests = await this.ipRequestRepository.find({
      where: { company: { id: companyId } },
      relations: ['company', 'company.user', 'company.room', 'ip', 'requestedBy'],
      order: { requestDate: 'DESC' },
    });
    return toIpRequestResponseDtoList(requests);
  }

  /**
   * Buscar uma solicitação específica
   */
  async findOne(id: string): Promise<IpRequestResponseDto> {
    const request = await this.ipRequestRepository.findOne({
      where: { id },
      relations: ['company', 'company.user', 'company.room', 'ip', 'requestedBy'],
    });

    if (!request) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    return toIpRequestResponseDto(request);
  }
}