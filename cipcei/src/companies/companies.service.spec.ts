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

describe('CompaniesService', () => {
  let service: CompaniesService;
  let companyRepository: jest.Mocked<Repository<Company>>;
  let roomRepository: jest.Mocked<Repository<Room>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let ipRepository: jest.Mocked<Repository<Ip>>;
  let dataSource: jest.Mocked<DataSource>;
  let mockEntityManager: jest.Mocked<EntityManager>;

  const mockRoom: Room = {
    id: 'room-uuid-123',
    roomNumber: 101,
    description: 'Test Room',
    ips: [],
    companies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser: User = {
    id: 'user-uuid-456',
    email: 'company@test.com',
    name: 'Company User',
    password: 'hashedPassword',
    role: UserRole.COMPANY,
    isActive: true,
    company: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockCompany: Company = {
    id: 'company-uuid-789',
    user: mockUser,
    room: mockRoom,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockIp: Ip = {
    id: 'ip-uuid-001',
    address: '10.0.0.100',
    macAddress: 'AA:BB:CC:DD:EE:FF',
    isTemporary: false,
    expiresAt: null,
    status: IpStatus.IN_USE,
    company: mockCompany,
    room: mockRoom,
    assignedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    companyRepository = module.get(getRepositoryToken(Company)) as jest.Mocked<Repository<Company>>;
    roomRepository = module.get(getRepositoryToken(Room)) as jest.Mocked<Repository<Room>>;
    userRepository = module.get(getRepositoryToken(User)) as jest.Mocked<Repository<User>>;
    ipRepository = module.get(getRepositoryToken(Ip)) as jest.Mocked<Repository<Ip>>;
    dataSource = module.get(DataSource) as jest.Mocked<DataSource>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      companyRepository.find.mockResolvedValue([mockCompany]);

      const result = await service.findAll();

      expect(result).toEqual([mockCompany]);
      expect(companyRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no companies exist', async () => {
      companyRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
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

      const result = await service.create(createDto);

      expect(result).toEqual(mockCompany);
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

      await service.create(dtoWithAdminRole);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.COMPANY }),
      );
    });
  });

  describe('findOne', () => {
    it('should find a company by id', async () => {
      companyRepository.findOneBy.mockResolvedValue(mockCompany);

      const result = await service.findOne(mockCompany.id);

      expect(result).toEqual(mockCompany);
      expect(companyRepository.findOneBy).toHaveBeenCalledWith({ id: mockCompany.id });
    });

    it('should return null when company not found', async () => {
      companyRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateDto: UpdateCompanyDto = {};

    it('should successfully update a company', async () => {
      const updatedCompany = { ...mockCompany };
      companyRepository.preload.mockResolvedValue(updatedCompany);
      companyRepository.save.mockResolvedValue(updatedCompany);

      const result = await service.update(mockCompany.id, updateDto);

      expect(result).toEqual(updatedCompany);
      expect(companyRepository.preload).toHaveBeenCalledWith({
        id: mockCompany.id,
        ...updateDto,
      });
    });

    it('should throw NotFoundException when company does not exist', async () => {
      companyRepository.preload.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(
        new NotFoundException('Company with ID "non-existent-id" not found'),
      );
    });
  });

  describe('remove', () => {
    it('should successfully remove a company and deactivate user', async () => {
      dataSource.transaction.mockImplementation(async (callback) => {
        return callback(mockEntityManager);
      });

      mockEntityManager.findOne.mockResolvedValue({
        ...mockCompany,
        room: mockRoom,
      } as any);
      mockEntityManager.find.mockResolvedValue([]);

      await service.remove(mockCompany.id);

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

    it('should release IPs when removing company', async () => {
      const mockIpsToRelease = [{ id: 'ip-1' }, { id: 'ip-2' }];

      dataSource.transaction.mockImplementation(async (callback) => {
        return callback(mockEntityManager);
      });

      mockEntityManager.findOne.mockResolvedValue({
        ...mockCompany,
        room: mockRoom,
      } as any);
      mockEntityManager.find.mockResolvedValue(mockIpsToRelease as any);

      await service.remove(mockCompany.id);

      // Verifica que busca IPs da EMPRESA (não da sala) - correção para múltiplas empresas por sala
      expect(mockEntityManager.find).toHaveBeenCalledWith(Ip, {
        select: ['id'],
        where: {
          company: { id: mockCompany.id },
          status: IpStatus.IN_USE,
        },
      });

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
          isTemporary: false,
        },
      );
    });

    it('should throw NotFoundException when company does not exist', async () => {
      dataSource.transaction.mockImplementation(async (callback) => {
        return callback(mockEntityManager);
      });

      mockEntityManager.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        new NotFoundException('Empresa com ID "non-existent-id" não encontrada'),
      );
    });
  });

  describe('getAllMyIps', () => {
    it('should return all IPs for a company', async () => {
      const ips = [mockIp];
      ipRepository.find.mockResolvedValue(ips);

      const result = await service.getAllMyIps(mockCompany.id);

      expect(result).toEqual(ips);
      expect(ipRepository.find).toHaveBeenCalledWith({
        where: { company: { id: mockCompany.id } },
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
    it('should return only active IPs for a company', async () => {
      const activeIps = [mockIp];
      ipRepository.find.mockResolvedValue(activeIps);

      const result = await service.getActiveIps(mockCompany.id);

      expect(result).toEqual(activeIps);
      expect(ipRepository.find).toHaveBeenCalledWith({
        where: {
          company: { id: mockCompany.id },
          status: IpStatus.IN_USE,
        },
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
        }),
      );
    });
  });

  describe('getRenewableIps', () => {
    it('should return renewable IPs for a company', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockIp]),
      };

      ipRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.getRenewableIps(mockCompany.id);

      expect(result).toEqual([mockIp]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('ip.companyId = :companyId', {
        companyId: mockCompany.id,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('ip.isTemporary = :isTemporary', {
        isTemporary: true,
      });
    });

    it('should filter by expiration date (7 days)', async () => {
      const mockQueryBuilder = {
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