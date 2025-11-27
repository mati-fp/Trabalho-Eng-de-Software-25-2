import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { Room } from '../rooms/entities/room.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Ip, IpStatus } from '../ips/entities/ip.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { IpHistoryService } from '../ip-history/ip-history.service';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let companyRepository: jest.Mocked<Repository<Company>>;
  let roomRepository: jest.Mocked<Repository<Room>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let ipRepository: jest.Mocked<Repository<Ip>>;
  let ipHistoryService: jest.Mocked<IpHistoryService>;
  let dataSource: jest.Mocked<DataSource>;
  let mockEntityManager: jest.Mocked<EntityManager>;

  const mockRoom: Room = {
    id: 'room-uuid-123',
    number: 101,
    ips: [],
    companies: [],
  };

  const mockUser = {
    id: 'user-uuid-456',
    email: 'company@test.com',
    name: 'Company User',
    password: 'hashedPassword',
    role: UserRole.COMPANY,
    isActive: true,
    company: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    hashPassword: jest.fn(),
  } as unknown as User;

  const mockCompany = {
    id: 'company-uuid-789',
    user: mockUser,
    room: mockRoom,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  } as Company;

  const mockIp = {
    id: 'ip-uuid-001',
    address: '10.0.0.100',
    macAddress: 'AA:BB:CC:DD:EE:FF',
    userName: 'Test User',
    isTemporary: false,
    expiresAt: undefined,
    lastRenewedAt: undefined,
    status: IpStatus.IN_USE,
    company: mockCompany,
    room: mockRoom,
    assignedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Ip;

  const mockAdminUser = {
    id: 'admin-uuid-999',
    email: 'admin@cei.ufrgs.br',
    name: 'Admin User',
    password: 'hashedPassword',
    role: UserRole.ADMIN,
    isActive: true,
    company: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    hashPassword: jest.fn(),
  } as unknown as User;

  beforeEach(async () => {
    mockEntityManager = {
      findOne: jest.fn(),
      find: jest.fn(),
      softRemove: jest.fn(),
      update: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getRepositoryToken(Company),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Room),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Ip),
          useValue: {
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
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

    service = module.get<CompaniesService>(CompaniesService);
    companyRepository = module.get(getRepositoryToken(Company)) as jest.Mocked<Repository<Company>>;
    roomRepository = module.get(getRepositoryToken(Room)) as jest.Mocked<Repository<Room>>;
    userRepository = module.get(getRepositoryToken(User)) as jest.Mocked<Repository<User>>;
    ipRepository = module.get(getRepositoryToken(Ip)) as jest.Mocked<Repository<Ip>>;
    ipHistoryService = module.get(IpHistoryService) as jest.Mocked<IpHistoryService>;
    dataSource = module.get(DataSource) as jest.Mocked<DataSource>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all companies with roomNumber (without room object)', async () => {
      companyRepository.find.mockResolvedValue([mockCompany]);

      const result = await service.findAll();

      // Deve retornar empresa como DTO com roomNumber
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockCompany.id);
      expect(result[0].roomNumber).toBe(101);
      expect(result[0].user.id).toBe(mockUser.id);
      expect(result[0].user.email).toBe(mockUser.email);
      expect(companyRepository.find).toHaveBeenCalledWith({ relations: ['room', 'user'] });
    });

    it('should return empty array when no companies exist', async () => {
      companyRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should return roomNumber as undefined when company has no room', async () => {
      const companyWithoutRoom = { ...mockCompany, room: undefined };
      companyRepository.find.mockResolvedValue([companyWithoutRoom as any]);

      const result = await service.findAll();

      expect(result.length).toBe(1);
      expect(result[0].roomNumber).toBeUndefined();
    });
  });

  describe('create', () => {
    const createDto: CreateCompanyDto = {
      user: {
        email: 'newcompany@test.com',
        name: 'New Company',
        password: 'Password@123',
        role: UserRole.COMPANY,
      },
      roomId: mockRoom.id,
    };

    it('should successfully create a new company', async () => {
      userRepository.findOneBy.mockResolvedValue(null);
      roomRepository.findOneBy.mockResolvedValue(mockRoom);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      companyRepository.create.mockReturnValue(mockCompany);
      companyRepository.save.mockResolvedValue(mockCompany);
      companyRepository.findOne.mockResolvedValue(mockCompany);

      const result = await service.create(createDto);

      // Agora retorna DTO
      expect(result.id).toBe(mockCompany.id);
      expect(result.roomNumber).toBe(101);
      expect(result.user.id).toBe(mockUser.id);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: createDto.user.email });
      expect(roomRepository.findOneBy).toHaveBeenCalledWith({ id: createDto.roomId });
      expect(userRepository.save).toHaveBeenCalledTimes(2);
      expect(companyRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when email already exists', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(
        new ConflictException(`O email "${createDto.user.email}" já está em uso.`),
      );

      expect(roomRepository.findOneBy).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when room does not exist', async () => {
      userRepository.findOneBy.mockResolvedValue(null);
      roomRepository.findOneBy.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException(`Sala com ID "${createDto.roomId}" não encontrada.`),
      );
    });

    it('should force role to be COMPANY', async () => {
      const dtoWithAdminRole = {
        ...createDto,
        user: { ...createDto.user, role: UserRole.ADMIN },
      };

      userRepository.findOneBy.mockResolvedValue(null);
      roomRepository.findOneBy.mockResolvedValue(mockRoom);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      companyRepository.create.mockReturnValue(mockCompany);
      companyRepository.save.mockResolvedValue(mockCompany);
      companyRepository.findOne.mockResolvedValue(mockCompany);

      await service.create(dtoWithAdminRole);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.COMPANY }),
      );
    });
  });

  describe('findOne', () => {
    it('should find a company by id and return DTO', async () => {
      companyRepository.findOne.mockResolvedValue(mockCompany);

      const result = await service.findOne(mockCompany.id);

      // Agora retorna DTO
      expect(result?.id).toBe(mockCompany.id);
      expect(result?.roomNumber).toBe(101);
      expect(result?.user.id).toBe(mockUser.id);
      expect(companyRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCompany.id },
        relations: ['room', 'user'],
      });
    });

    it('should return null when company not found', async () => {
      companyRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateDto: UpdateCompanyDto = {};

    it('should successfully update a company and return DTO', async () => {
      const updatedCompany = { ...mockCompany };
      companyRepository.preload.mockResolvedValue(updatedCompany);
      companyRepository.save.mockResolvedValue(updatedCompany);
      companyRepository.findOne.mockResolvedValue(updatedCompany);

      const result = await service.update(mockCompany.id, updateDto);

      // Agora retorna DTO
      expect(result.id).toBe(mockCompany.id);
      expect(result.roomNumber).toBe(101);
      expect(companyRepository.preload).toHaveBeenCalledWith({
        id: mockCompany.id,
        ...updateDto,
      });
    });

    it('should throw NotFoundException when company does not exist', async () => {
      companyRepository.preload.mockResolvedValue(undefined);

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(
        new NotFoundException('Empresa com ID "non-existent-id" nao encontrada'),
      );
    });
  });

  describe('remove', () => {
    it('should successfully remove a company and deactivate user', async () => {
      (dataSource.transaction as jest.Mock).mockImplementation(async (callback: any) => {
        return callback(mockEntityManager);
      });

      mockEntityManager.findOne.mockResolvedValue({
        ...mockCompany,
        room: mockRoom,
      } as any);
      mockEntityManager.find.mockResolvedValue([]);

      await service.remove(mockCompany.id, mockAdminUser);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Company, {
        where: { id: mockCompany.id },
        relations: ['user', 'room'],
      });
      expect(mockEntityManager.softRemove).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockCompany.id }),
      );
      expect(mockEntityManager.update).toHaveBeenCalledWith(User, mockUser.id, {
        isActive: false,
      });
    });

    it('should release IPs and create audit logs when removing company', async () => {
      const mockIpsToRelease = [
        { id: 'ip-1', macAddress: 'AA:BB:CC:DD:EE:01', userName: 'User 1', room: mockRoom },
        { id: 'ip-2', macAddress: 'AA:BB:CC:DD:EE:02', userName: 'User 2', room: mockRoom },
      ];

      (dataSource.transaction as jest.Mock).mockImplementation(async (callback: any) => {
        return callback(mockEntityManager);
      });

      mockEntityManager.findOne.mockResolvedValue({
        ...mockCompany,
        room: mockRoom,
      } as any);
      mockEntityManager.find.mockResolvedValue(mockIpsToRelease as any);

      await service.remove(mockCompany.id, mockAdminUser);

      // Verifica que busca IPs da EMPRESA com relations para audit log
      expect(mockEntityManager.find).toHaveBeenCalledWith(Ip, {
        where: {
          company: { id: mockCompany.id },
          status: IpStatus.IN_USE,
        },
        relations: ['room'],
      });

      // Verifica que criou logs de auditoria para cada IP liberado
      expect(ipHistoryService.create).toHaveBeenCalledTimes(2);
      expect(ipHistoryService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'released',
          performedBy: mockAdminUser,
        }),
      );

      // Verifica que atualizou os IPs
      expect(mockEntityManager.update).toHaveBeenCalledWith(
        Ip,
        { id: expect.anything() },
        {
          status: IpStatus.AVAILABLE,
          company: undefined,
          macAddress: undefined,
          userName: undefined,
          assignedAt: undefined,
          expiresAt: undefined,
          lastRenewedAt: undefined,
          isTemporary: false,
        },
      );
    });

    it('should not create audit logs when company has no IPs', async () => {
      (dataSource.transaction as jest.Mock).mockImplementation(async (callback: any) => {
        return callback(mockEntityManager);
      });

      mockEntityManager.findOne.mockResolvedValue({
        ...mockCompany,
        room: mockRoom,
      } as any);
      mockEntityManager.find.mockResolvedValue([]);

      await service.remove(mockCompany.id, mockAdminUser);

      expect(ipHistoryService.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when company does not exist', async () => {
      (dataSource.transaction as jest.Mock).mockImplementation(async (callback: any) => {
        return callback(mockEntityManager);
      });

      mockEntityManager.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id', mockAdminUser)).rejects.toThrow(
        new NotFoundException('Empresa com ID "non-existent-id" não encontrada'),
      );
    });
  });

  describe('getAllMyIps', () => {
    it('should return all IPs as DTOs for a company', async () => {
      const ips = [mockIp];
      ipRepository.find.mockResolvedValue(ips);

      const result = await service.getAllMyIps(mockCompany.id);

      // Verifica DTO
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockIp.id);
      expect(result[0].address).toBe(mockIp.address);
      expect(ipRepository.find).toHaveBeenCalledWith({
        where: { company: { id: mockCompany.id } },
        relations: ['room', 'company', 'company.user'],
        order: { assignedAt: 'DESC' },
      });
    });

    it('should return empty array when company has no IPs', async () => {
      ipRepository.find.mockResolvedValue([]);

      const result = await service.getAllMyIps(mockCompany.id);

      expect(result).toEqual([]);
    });
  });

  describe('getActiveIps', () => {
    it('should return only active IPs as DTOs for a company', async () => {
      const activeIps = [mockIp];
      ipRepository.find.mockResolvedValue(activeIps);

      const result = await service.getActiveIps(mockCompany.id);

      // Verifica DTO
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockIp.id);
      expect(result[0].status).toBe(IpStatus.IN_USE);
      expect(ipRepository.find).toHaveBeenCalledWith({
        where: {
          company: { id: mockCompany.id },
          status: IpStatus.IN_USE,
        },
        relations: ['room', 'company', 'company.user'],
        order: { assignedAt: 'DESC' },
      });
    });

    it('should filter out non-active IPs', async () => {
      ipRepository.find.mockResolvedValue([mockIp]);

      await service.getActiveIps(mockCompany.id);

      expect(ipRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: IpStatus.IN_USE,
          }),
          relations: ['room', 'company', 'company.user'],
        }),
      );
    });
  });

  describe('getRenewableIps', () => {
    it('should return renewable IPs as DTOs for a company', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockIp]),
      };

      ipRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.getRenewableIps(mockCompany.id);

      // Verifica DTO
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockIp.id);
      expect(result[0].address).toBe(mockIp.address);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('ip.companyId = :companyId', {
        companyId: mockCompany.id,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('ip.isTemporary = :isTemporary', {
        isTemporary: true,
      });
    });

    it('should filter by expiration date (7 days)', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      ipRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      await service.getRenewableIps(mockCompany.id);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ip.expiresAt'),
        expect.objectContaining({
          expired: IpStatus.EXPIRED,
          sevenDays: expect.any(Date),
        }),
      );
    });
  });
});