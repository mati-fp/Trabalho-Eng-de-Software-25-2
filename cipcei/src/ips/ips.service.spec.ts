import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { IpsService } from './ips.service';
import { Ip, IpStatus } from './entities/ip.entity';
import { Room } from '../rooms/entities/room.entity';
import { Company } from '../companies/entities/company.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateIpDto } from './dto/create-ip.dto';
import { AssignIpDto } from './dto/assign-ip.dto';
import { FindAllIpsDto } from './dto/find-all-ips.dto';
import { IpHistoryService } from '../ip-history/ip-history.service';

describe('IpsService', () => {
  let service: IpsService;
  let ipRepository: jest.Mocked<Repository<Ip>>;
  let roomRepository: jest.Mocked<Repository<Room>>;
  let companyRepository: jest.Mocked<Repository<Company>>;
  let ipHistoryService: jest.Mocked<IpHistoryService>;

  const mockRoom = {
    id: 'room-uuid-123',
    number: 101,
  };

  const mockCompany = {
    id: 'company-uuid-456',
    room: mockRoom,
    user: { id: 'user-uuid-789', name: 'Test Company' },
  };

  const mockIp = {
    id: 'ip-uuid-001',
    address: '10.0.0.100',
    status: IpStatus.AVAILABLE,
    macAddress: '',
    room: mockRoom,
    company: null,
  };

  const mockAdminUser = {
    id: 'admin-uuid-999',
    email: 'admin@cei.ufrgs.br',
    name: 'Admin User',
    role: UserRole.ADMIN,
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IpsService,
        {
          provide: getRepositoryToken(Ip),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Room),
          useValue: {
            findOneBy: jest.fn(),
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
      ],
    }).compile();

    service = module.get<IpsService>(IpsService);
    ipRepository = module.get(getRepositoryToken(Ip)) as jest.Mocked<Repository<Ip>>;
    roomRepository = module.get(getRepositoryToken(Room)) as jest.Mocked<Repository<Room>>;
    companyRepository = module.get(getRepositoryToken(Company)) as jest.Mocked<Repository<Company>>;
    ipHistoryService = module.get(IpHistoryService) as jest.Mocked<IpHistoryService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return IPs as DTOs with filters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockIp]),
      };

      ipRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const filters: FindAllIpsDto = {
        status: IpStatus.AVAILABLE,
      };

      const result = await service.findAll(filters);

      // Verifica retorno como array
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockIp.id);
      expect(result[0].address).toBe(mockIp.address);
      expect(result[0].status).toBe(mockIp.status);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter by company name', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockIp]),
      };

      ipRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      await service.findAll({ companyName: 'Test Company' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(user.name)'),
        expect.objectContaining({ companyName: '%Test Company%' }),
      );
    });

    it('should return empty array when no IPs match', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      ipRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({});

      expect(result).toEqual([]);
    });
  });

  describe('bulkCreate', () => {
    const createIpDtos: CreateIpDto[] = [
      { address: '10.0.0.100' },
      { address: '10.0.0.101' },
    ];

    it('should successfully create multiple IPs and return DTOs', async () => {
      roomRepository.findOneBy.mockResolvedValue(mockRoom as any);
      ipRepository.create.mockImplementation((data: any) => ({ ...mockIp, ...data }));
      ipRepository.save.mockResolvedValue([mockIp, mockIp] as any);
      ipRepository.find.mockResolvedValue([mockIp, mockIp] as any);

      const result = await service.bulkCreate(mockRoom.id, createIpDtos);

      // Verifica DTOs
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(mockIp.id);
      expect(result[0].address).toBe(mockIp.address);
      expect(roomRepository.findOneBy).toHaveBeenCalledWith({ id: mockRoom.id });
      expect(ipRepository.create).toHaveBeenCalledTimes(2);
      expect(ipRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when room does not exist', async () => {
      roomRepository.findOneBy.mockResolvedValue(null);

      await expect(service.bulkCreate('invalid-id', createIpDtos)).rejects.toThrow(
        new NotFoundException('Sala com ID "invalid-id" nao encontrada'),
      );
    });
  });

  describe('assign', () => {
    const assignIpDto: AssignIpDto = {
      macAddress: 'AA:BB:CC:DD:EE:FF',
      companyId: mockCompany.id,
    };

    it('should successfully assign IP to company and return DTO', async () => {
      const ipWithRoom = { ...mockIp, room: mockRoom };
      const assignedIp = { ...ipWithRoom, status: IpStatus.IN_USE, macAddress: assignIpDto.macAddress, company: mockCompany };

      // Primeiro findOne para buscar IP inicial, segundo após save para DTO
      ipRepository.findOne
        .mockResolvedValueOnce(ipWithRoom as any)
        .mockResolvedValueOnce(assignedIp as any);
      companyRepository.findOne.mockResolvedValue(mockCompany as any);
      ipRepository.save.mockResolvedValue(assignedIp as any);

      const result = await service.assign(mockIp.id, assignIpDto, mockAdminUser);

      expect(result.status).toBe(IpStatus.IN_USE);
      expect(result.macAddress).toBe(assignIpDto.macAddress);
      expect(ipHistoryService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'assigned',
          macAddress: assignIpDto.macAddress,
          notes: 'Atribuicao direta pelo admin',
        }),
      );
    });

    it('should throw NotFoundException when IP does not exist', async () => {
      ipRepository.findOne.mockResolvedValue(null);

      await expect(service.assign('invalid-id', assignIpDto, mockAdminUser)).rejects.toThrow(
        new NotFoundException('IP com ID "invalid-id" nao encontrado'),
      );
    });

    it('should throw ConflictException when IP is already in use', async () => {
      const ipInUse = { ...mockIp, status: IpStatus.IN_USE };
      ipRepository.findOne.mockResolvedValue(ipInUse as any);

      await expect(service.assign(mockIp.id, assignIpDto, mockAdminUser)).rejects.toThrow(
        new ConflictException(`Endereco IP ${mockIp.address} ja esta em uso`),
      );
    });

    it('should throw NotFoundException when company does not exist', async () => {
      ipRepository.findOne.mockResolvedValue({ ...mockIp, room: mockRoom } as any);
      companyRepository.findOne.mockResolvedValue(null);

      await expect(service.assign(mockIp.id, assignIpDto, mockAdminUser)).rejects.toThrow(
        new NotFoundException(`Empresa com ID "${assignIpDto.companyId}" nao encontrada`),
      );
    });

    it('should throw BadRequestException when rooms do not match', async () => {
      const differentRoom = { id: 'different-room', number: 999 };
      ipRepository.findOne.mockResolvedValue({ ...mockIp, room: mockRoom } as any);
      companyRepository.findOne.mockResolvedValue({ ...mockCompany, room: differentRoom } as any);

      await expect(service.assign(mockIp.id, assignIpDto, mockAdminUser)).rejects.toThrow(
        new BadRequestException('Endereco IP nao pertence a sala da empresa'),
      );
    });
  });

  describe('unassign', () => {
    it('should successfully unassign IP and return DTO', async () => {
      const ipInUse = { ...mockIp, status: IpStatus.IN_USE, macAddress: 'AA:BB:CC:DD:EE:FF', company: mockCompany };
      const unassignedIp = { ...mockIp, status: IpStatus.AVAILABLE, macAddress: undefined, company: null };

      // Primeiro findOne carrega IP com company, segundo para DTO
      ipRepository.findOne
        .mockResolvedValueOnce(ipInUse as any)
        .mockResolvedValueOnce(unassignedIp as any);
      ipRepository.save.mockResolvedValue(unassignedIp as any);

      const result = await service.unassign(mockIp.id, mockAdminUser);

      expect(result.status).toBe(IpStatus.AVAILABLE);
      expect(result.macAddress).toBeUndefined();
      expect(ipHistoryService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'released',
          notes: 'Liberacao direta pelo admin',
        }),
      );
    });

    it('should throw NotFoundException when IP does not exist', async () => {
      ipRepository.findOne.mockResolvedValue(null);

      await expect(service.unassign('invalid-id', mockAdminUser)).rejects.toThrow(
        new NotFoundException('IP com ID "invalid-id" nao encontrado'),
      );
    });

    it('should throw ConflictException when IP is already available', async () => {
      ipRepository.findOne.mockResolvedValue(mockIp as any);

      await expect(service.unassign(mockIp.id, mockAdminUser)).rejects.toThrow(
        new ConflictException(`Endereco IP ${mockIp.address} ja esta disponivel`),
      );
    });
  });
});
