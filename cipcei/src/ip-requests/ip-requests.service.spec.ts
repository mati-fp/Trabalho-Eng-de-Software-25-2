import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IpRequestsService } from './ip-requests.service';
import { IpRequest, IpRequestStatus, IpRequestType } from './entities/ip-request.entity';
import { Ip, IpStatus } from '../ips/entities/ip.entity';
import { Company } from '../companies/entities/company.entity';
import { IpHistoryService } from '../ip-history/ip-history.service';
import { UserRole } from '../users/entities/user.entity';

describe('IpRequestsService', () => {
  let service: IpRequestsService;
  let ipRequestRepository: jest.Mocked<Repository<IpRequest>>;
  let ipRepository: jest.Mocked<Repository<Ip>>;
  let companyRepository: jest.Mocked<Repository<Company>>;
  let ipHistoryService: jest.Mocked<IpHistoryService>;
  let dataSource: jest.Mocked<DataSource>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;

  const mockUser = {
    id: 'user-uuid-123',
    email: 'company@test.com',
    name: 'Company User',
    role: UserRole.COMPANY,
    company: { id: 'company-uuid-456' },
  };

  const mockAdmin = {
    id: 'admin-uuid-789',
    email: 'admin@cei.ufrgs.br',
    name: 'Admin',
    role: UserRole.ADMIN,
  };

  const mockRoom = {
    id: 'room-uuid-111',
    number: 101,
  };

  const mockCompany = {
    id: 'company-uuid-456',
    room: mockRoom,
  };

  const mockIp = {
    id: 'ip-uuid-001',
    address: '10.0.0.100',
    status: IpStatus.AVAILABLE,
    room: mockRoom,
  };

  const mockRequest = {
    id: 'request-uuid-999',
    requestType: IpRequestType.NEW,
    status: IpRequestStatus.PENDING,
    company: mockCompany,
    requestedBy: mockUser,
    justification: 'Test request',
  };

  let mockManagerSave: jest.Mock;

  beforeEach(async () => {
    mockManagerSave = jest.fn();

    const mockManager = {
      save: mockManagerSave,
      findOne: jest.fn(),
    };

    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: mockManager,
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IpRequestsService,
        {
          provide: getRepositoryToken(IpRequest),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Ip),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Company),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: IpHistoryService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<IpRequestsService>(IpRequestsService);
    ipRequestRepository = module.get(getRepositoryToken(IpRequest)) as jest.Mocked<Repository<IpRequest>>;
    ipRepository = module.get(getRepositoryToken(Ip)) as jest.Mocked<Repository<Ip>>;
    companyRepository = module.get(getRepositoryToken(Company)) as jest.Mocked<Repository<Company>>;
    ipHistoryService = module.get(IpHistoryService) as jest.Mocked<IpHistoryService>;
    dataSource = module.get(DataSource) as jest.Mocked<DataSource>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      requestType: IpRequestType.NEW,
      justification: 'Need new IP',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      userName: 'Test User',
    };

    it('should successfully create a NEW IP request and return DTO', async () => {
      const requestWithRelations = { ...mockRequest, company: { ...mockCompany, user: mockUser, room: mockRoom } };

      companyRepository.findOne.mockResolvedValue(mockCompany as any);
      ipRequestRepository.create.mockReturnValue(mockRequest as any);
      ipRequestRepository.save.mockResolvedValue(mockRequest as any);
      ipRequestRepository.findOne.mockResolvedValue(requestWithRelations as any);

      const result = await service.create(createDto, mockUser as any);

      // Verifica DTO
      expect(result.id).toBe(mockRequest.id);
      expect(result.requestType).toBe(mockRequest.requestType);
      expect(result.status).toBe(mockRequest.status);
      expect(companyRepository.findOne).toHaveBeenCalled();
      expect(ipRequestRepository.create).toHaveBeenCalled();
      expect(ipRequestRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user has no company', async () => {
      const userWithoutCompany = { ...mockUser, company: null };

      await expect(service.create(createDto, userWithoutCompany as any)).rejects.toThrow(
        new UnauthorizedException('Usuário não possui empresa associada'),
      );
    });

    it('should throw BadRequestException when company has no room', async () => {
      companyRepository.findOne.mockResolvedValue({ ...mockCompany, room: null } as any);

      await expect(service.create(createDto, mockUser as any)).rejects.toThrow(
        new BadRequestException('Empresa não possui sala associada'),
      );
    });

    it('should throw BadRequestException for RENEWAL without ipId', async () => {
      const renewalDto = {
        ...createDto,
        requestType: IpRequestType.RENEWAL,
      };
      companyRepository.findOne.mockResolvedValue(mockCompany as any);

      await expect(service.create(renewalDto, mockUser as any)).rejects.toThrow(
        new BadRequestException('ID do IP é obrigatório para renovação ou cancelamento'),
      );
    });

    it('should create RENEWAL request with valid IP and return DTO', async () => {
      const renewalDto = {
        ...createDto,
        requestType: IpRequestType.RENEWAL,
        ipId: mockIp.id,
      };
      const requestWithRelations = { ...mockRequest, company: { ...mockCompany, user: mockUser, room: mockRoom } };

      companyRepository.findOne.mockResolvedValue(mockCompany as any);
      ipRepository.findOne.mockResolvedValue({ ...mockIp, company: mockCompany } as any);
      ipRequestRepository.create.mockReturnValue(mockRequest as any);
      ipRequestRepository.save.mockResolvedValue(mockRequest as any);
      ipRequestRepository.findOne.mockResolvedValue(requestWithRelations as any);

      const result = await service.create(renewalDto, mockUser as any);

      expect(result.id).toBe(mockRequest.id);
      expect(ipHistoryService.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when IP does not belong to company', async () => {
      const renewalDto = {
        ...createDto,
        requestType: IpRequestType.RENEWAL,
        ipId: mockIp.id,
      };
      const otherCompany = { id: 'other-company', room: mockRoom };
      companyRepository.findOne.mockResolvedValue(mockCompany as any);
      ipRepository.findOne.mockResolvedValue({ ...mockIp, company: otherCompany } as any);

      await expect(service.create(renewalDto, mockUser as any)).rejects.toThrow(
        new UnauthorizedException('Este IP não pertence à sua empresa'),
      );
    });

    it('should throw BadRequestException for CANCELLATION without ipId', async () => {
      const cancellationDto = {
        ...createDto,
        requestType: IpRequestType.CANCELLATION,
      };
      companyRepository.findOne.mockResolvedValue(mockCompany as any);

      await expect(service.create(cancellationDto, mockUser as any)).rejects.toThrow(
        new BadRequestException('ID do IP é obrigatório para renovação ou cancelamento'),
      );
    });

    it('should throw NotFoundException when IP not found for RENEWAL', async () => {
      const renewalDto = {
        ...createDto,
        requestType: IpRequestType.RENEWAL,
        ipId: 'non-existent-ip',
      };
      companyRepository.findOne.mockResolvedValue(mockCompany as any);
      ipRepository.findOne.mockResolvedValue(null);

      await expect(service.create(renewalDto, mockUser as any)).rejects.toThrow(
        new NotFoundException('IP não encontrado'),
      );
    });

    it('should create CANCELLATION request with valid IP and return DTO', async () => {
      const cancellationDto = {
        ...createDto,
        requestType: IpRequestType.CANCELLATION,
        ipId: mockIp.id,
      };
      const cancellationRequest = { ...mockRequest, requestType: IpRequestType.CANCELLATION };
      const requestWithRelations = { ...cancellationRequest, company: { ...mockCompany, user: mockUser, room: mockRoom } };

      companyRepository.findOne.mockResolvedValue(mockCompany as any);
      ipRepository.findOne.mockResolvedValue({ ...mockIp, company: mockCompany } as any);
      ipRequestRepository.create.mockReturnValue(cancellationRequest as any);
      ipRequestRepository.save.mockResolvedValue(cancellationRequest as any);
      ipRequestRepository.findOne.mockResolvedValue(requestWithRelations as any);

      const result = await service.create(cancellationDto, mockUser as any);

      expect(result.requestType).toBe(IpRequestType.CANCELLATION);
      expect(ipHistoryService.create).toHaveBeenCalled();
    });
  });

  describe('approve', () => {
    const approveDto = {
      notes: 'Approved',
    };

    it('should approve NEW IP request and assign available IP', async () => {
      const request = { ...mockRequest, company: { ...mockCompany, room: mockRoom } };
      ipRequestRepository.findOne.mockResolvedValue(request as any);
      companyRepository.findOne.mockResolvedValue({ ...mockCompany, room: mockRoom } as any);
      ipRepository.findOne.mockResolvedValue(mockIp as any);
      mockManagerSave.mockResolvedValue({} as any);

      await service.approve(mockRequest.id, approveDto, mockAdmin as any);

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(ipHistoryService.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when request not found', async () => {
      ipRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.approve('invalid-id', approveDto, mockAdmin as any)).rejects.toThrow(
        new NotFoundException('Solicitação não encontrada'),
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when request already processed', async () => {
      const processedRequest = { ...mockRequest, status: IpRequestStatus.APPROVED };
      ipRequestRepository.findOne.mockResolvedValue(processedRequest as any);

      await expect(service.approve(mockRequest.id, approveDto, mockAdmin as any)).rejects.toThrow(
        new BadRequestException('Solicitação já foi processada'),
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should approve RENEWAL request and renew IP', async () => {
      const renewalRequest = {
        ...mockRequest,
        requestType: IpRequestType.RENEWAL,
        ip: mockIp,
        company: { ...mockCompany, room: mockRoom },
        expirationDate: new Date(),
      };
      ipRequestRepository.findOne.mockResolvedValue(renewalRequest as any);
      companyRepository.findOne.mockResolvedValue({ ...mockCompany, room: mockRoom } as any);
      mockManagerSave.mockResolvedValue({} as any);

      await service.approve(mockRequest.id, approveDto, mockAdmin as any);

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(ipHistoryService.create).toHaveBeenCalled();
    });

    it('should approve CANCELLATION request and release IP', async () => {
      const cancellationRequest = {
        ...mockRequest,
        requestType: IpRequestType.CANCELLATION,
        ip: { ...mockIp, status: IpStatus.IN_USE },
        company: { ...mockCompany, room: mockRoom },
      };
      ipRequestRepository.findOne.mockResolvedValue(cancellationRequest as any);
      companyRepository.findOne.mockResolvedValue({ ...mockCompany, room: mockRoom } as any);
      mockManagerSave.mockResolvedValue({} as any);

      await service.approve(mockRequest.id, approveDto, mockAdmin as any);

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(ipHistoryService.create).toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    const rejectDto = {
      rejectionReason: 'Insufficient justification',
    };

    it('should successfully reject a pending request', async () => {
      ipRequestRepository.findOne.mockResolvedValue(mockRequest as any);
      ipRequestRepository.save.mockResolvedValue({ ...mockRequest, status: IpRequestStatus.REJECTED } as any);

      const result = await service.reject(mockRequest.id, rejectDto, mockAdmin as any);

      expect(result.status).toBe(IpRequestStatus.REJECTED);
      expect(ipRequestRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when request not found', async () => {
      ipRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.reject('invalid-id', rejectDto, mockAdmin as any)).rejects.toThrow(
        new NotFoundException('Solicitação não encontrada'),
      );
    });

    it('should throw BadRequestException when request already processed', async () => {
      const processedRequest = { ...mockRequest, status: IpRequestStatus.APPROVED };
      ipRequestRepository.findOne.mockResolvedValue(processedRequest as any);

      await expect(service.reject(mockRequest.id, rejectDto, mockAdmin as any)).rejects.toThrow(
        new BadRequestException('Solicitação já foi processada'),
      );
    });

    it('should register rejection in history when IP is present', async () => {
      const requestWithIp = { ...mockRequest, ip: mockIp, status: IpRequestStatus.PENDING };
      ipRequestRepository.findOne.mockResolvedValue(requestWithIp as any);
      ipRequestRepository.save.mockResolvedValue({} as any);

      await service.reject(mockRequest.id, rejectDto, mockAdmin as any);

      expect(ipHistoryService.create).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should successfully cancel own pending request', async () => {
      const pendingRequest = { ...mockRequest, status: IpRequestStatus.PENDING };
      ipRequestRepository.findOne.mockResolvedValue(pendingRequest as any);
      ipRequestRepository.save.mockResolvedValue({ ...pendingRequest, status: IpRequestStatus.CANCELLED } as any);

      const result = await service.cancel(mockRequest.id, mockUser as any);

      expect(result.status).toBe(IpRequestStatus.CANCELLED);
    });

    it('should throw NotFoundException when request not found', async () => {
      ipRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel('invalid-id', mockUser as any)).rejects.toThrow(
        new NotFoundException('Solicitação não encontrada'),
      );
    });

    it('should throw UnauthorizedException when request does not belong to user company', async () => {
      const otherCompanyRequest = { ...mockRequest, company: { id: 'other-company' } };
      ipRequestRepository.findOne.mockResolvedValue(otherCompanyRequest as any);

      await expect(service.cancel(mockRequest.id, mockUser as any)).rejects.toThrow(
        new UnauthorizedException('Você não pode cancelar esta solicitação'),
      );
    });

    it('should throw BadRequestException when request is not pending', async () => {
      const approvedRequest = { ...mockRequest, status: IpRequestStatus.APPROVED };
      ipRequestRepository.findOne.mockResolvedValue(approvedRequest as any);

      await expect(service.cancel(mockRequest.id, mockUser as any)).rejects.toThrow(
        new BadRequestException('Apenas solicitações pendentes podem ser canceladas'),
      );
    });
  });

  describe('findAll', () => {
    it('should return all requests as DTOs ordered by date DESC', async () => {
      const requestsWithRelations = [{ ...mockRequest, company: { ...mockCompany, user: mockUser, room: mockRoom } }];
      ipRequestRepository.find.mockResolvedValue(requestsWithRelations as any);

      const result = await service.findAll();

      // Verifica DTO
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockRequest.id);
      expect(result[0].requestType).toBe(mockRequest.requestType);
      expect(ipRequestRepository.find).toHaveBeenCalledWith({
        relations: ['company', 'company.user', 'company.room', 'ip', 'requestedBy'],
        order: { requestDate: 'DESC' },
      });
    });
  });

  describe('findPending', () => {
    it('should return only pending requests as DTOs ordered by date ASC', async () => {
      const requestsWithRelations = [{ ...mockRequest, company: { ...mockCompany, user: mockUser, room: mockRoom } }];
      ipRequestRepository.find.mockResolvedValue(requestsWithRelations as any);

      const result = await service.findPending();

      // Verifica DTO
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockRequest.id);
      expect(ipRequestRepository.find).toHaveBeenCalledWith({
        where: { status: IpRequestStatus.PENDING },
        relations: ['company', 'company.user', 'company.room', 'ip', 'requestedBy'],
        order: { requestDate: 'ASC' },
      });
    });
  });

  describe('findByCompany', () => {
    it('should return requests as DTOs for specific company', async () => {
      const requestsWithRelations = [{ ...mockRequest, company: { ...mockCompany, user: mockUser, room: mockRoom } }];
      ipRequestRepository.find.mockResolvedValue(requestsWithRelations as any);

      const result = await service.findByCompany(mockCompany.id);

      // Verifica DTO
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockRequest.id);
      expect(ipRequestRepository.find).toHaveBeenCalledWith({
        where: { company: { id: mockCompany.id } },
        relations: ['company', 'company.user', 'company.room', 'ip', 'requestedBy'],
        order: { requestDate: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a specific request as DTO', async () => {
      const requestWithRelations = { ...mockRequest, company: { ...mockCompany, user: mockUser, room: mockRoom } };
      ipRequestRepository.findOne.mockResolvedValue(requestWithRelations as any);

      const result = await service.findOne(mockRequest.id);

      // Verifica DTO
      expect(result.id).toBe(mockRequest.id);
      expect(result.requestType).toBe(mockRequest.requestType);
    });

    it('should throw NotFoundException when request not found', async () => {
      ipRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        new NotFoundException('Solicitação não encontrada'),
      );
    });
  });
});