import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { IpHistoryService } from './ip-history.service';
import { IpHistory, IpAction } from './entities/ip-history.entity';
import { IpStatus } from '../ips/entities/ip.entity';
import { UserRole } from '../users/entities/user.entity';

describe('IpHistoryService', () => {
  let service: IpHistoryService;
  let repository: jest.Mocked<Repository<IpHistory>>;

  const mockUser = {
    id: 'user-uuid-123',
    email: 'admin@cei.ufrgs.br',
    name: 'Admin',
    role: UserRole.ADMIN,
  };

  const mockCompany = {
    id: 'company-uuid-456',
    name: 'Test Company',
  };

  const mockIp = {
    id: 'ip-uuid-001',
    address: '10.0.0.100',
    status: IpStatus.IN_USE,
  };

  const mockHistory = {
    id: 'history-uuid-111',
    ip: mockIp,
    company: mockCompany,
    action: IpAction.ASSIGNED,
    performedBy: mockUser,
    performedAt: new Date('2024-01-01'),
    macAddress: 'AA:BB:CC:DD:EE:FF',
    userName: 'Test User',
    notes: 'IP assigned successfully',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IpHistoryService,
        {
          provide: getRepositoryToken(IpHistory),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IpHistoryService>(IpHistoryService);
    repository = module.get(getRepositoryToken(IpHistory)) as jest.Mocked<Repository<IpHistory>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a history entry with all fields', async () => {
      const createData = {
        ip: mockIp as any,
        company: mockCompany as any,
        action: IpAction.ASSIGNED,
        performedBy: mockUser as any,
        macAddress: 'AA:BB:CC:DD:EE:FF',
        userName: 'Test User',
        notes: 'IP assigned',
        expirationDate: new Date('2024-12-31'),
      };

      repository.create.mockReturnValue(mockHistory as any);
      repository.save.mockResolvedValue(mockHistory as any);

      const result = await service.create(createData);

      expect(result).toEqual(mockHistory);
      expect(repository.create).toHaveBeenCalledWith(createData);
      expect(repository.save).toHaveBeenCalledWith(mockHistory);
    });

    it('should create history entry without optional fields', async () => {
      const minimalData = {
        ip: mockIp as any,
        action: IpAction.RELEASED,
        performedBy: mockUser as any,
      };

      const minimalHistory = {
        ...mockHistory,
        company: null,
        macAddress: null,
        userName: null,
        notes: null,
      };

      repository.create.mockReturnValue(minimalHistory as any);
      repository.save.mockResolvedValue(minimalHistory as any);

      const result = await service.create(minimalData);

      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith(minimalData);
    });

    it('should create history for RENEWED action', async () => {
      const renewData = {
        ip: mockIp as any,
        company: mockCompany as any,
        action: IpAction.RENEWED,
        performedBy: mockUser as any,
        expirationDate: new Date('2025-01-01'),
      };

      repository.create.mockReturnValue({ ...mockHistory, action: IpAction.RENEWED } as any);
      repository.save.mockResolvedValue({ ...mockHistory, action: IpAction.RENEWED } as any);

      const result = await service.create(renewData);

      expect(result.action).toBe(IpAction.RENEWED);
    });

    it('should create history for RELEASED action', async () => {
      const releaseData = {
        ip: mockIp as any,
        company: mockCompany as any,
        action: IpAction.RELEASED,
        performedBy: mockUser as any,
      };

      repository.create.mockReturnValue({ ...mockHistory, action: IpAction.RELEASED } as any);
      repository.save.mockResolvedValue({ ...mockHistory, action: IpAction.RELEASED } as any);

      const result = await service.create(releaseData);

      expect(result.action).toBe(IpAction.RELEASED);
    });

    it('should create history for REQUEST_APPROVED action', async () => {
      const approveData = {
        ip: mockIp as any,
        company: mockCompany as any,
        action: IpAction.REQUEST_APPROVED,
        performedBy: mockUser as any,
        notes: 'Request approved by admin',
      };

      repository.create.mockReturnValue({ ...mockHistory, action: IpAction.REQUEST_APPROVED } as any);
      repository.save.mockResolvedValue({ ...mockHistory, action: IpAction.REQUEST_APPROVED } as any);

      const result = await service.create(approveData);

      expect(result.action).toBe(IpAction.REQUEST_APPROVED);
    });

    it('should create history for REQUEST_REJECTED action', async () => {
      const rejectData = {
        ip: mockIp as any,
        company: mockCompany as any,
        action: IpAction.REQUEST_REJECTED,
        performedBy: mockUser as any,
        notes: 'Insufficient justification',
      };

      repository.create.mockReturnValue({ ...mockHistory, action: IpAction.REQUEST_REJECTED } as any);
      repository.save.mockResolvedValue({ ...mockHistory, action: IpAction.REQUEST_REJECTED } as any);

      const result = await service.create(rejectData);

      expect(result.action).toBe(IpAction.REQUEST_REJECTED);
    });
  });

  describe('findByIp', () => {
    it('should return history for specific IP ordered by date DESC', async () => {
      const histories = [mockHistory];
      repository.find.mockResolvedValue(histories as any);

      const result = await service.findByIp(mockIp.id);

      expect(result).toEqual(histories);
      expect(repository.find).toHaveBeenCalledWith({
        where: { ip: { id: mockIp.id } },
        order: { performedAt: 'DESC' },
      });
    });

    it('should return empty array when IP has no history', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findByIp('ip-without-history');

      expect(result).toEqual([]);
    });

    it('should call repository with correct IP ID', async () => {
      repository.find.mockResolvedValue([]);

      await service.findByIp('test-ip-id');

      expect(repository.find).toHaveBeenCalledWith({
        where: { ip: { id: 'test-ip-id' } },
        order: { performedAt: 'DESC' },
      });
    });
  });

  describe('findByCompany', () => {
    it('should return history for specific company ordered by date DESC', async () => {
      const histories = [mockHistory];
      repository.find.mockResolvedValue(histories as any);

      const result = await service.findByCompany(mockCompany.id);

      expect(result).toEqual(histories);
      expect(repository.find).toHaveBeenCalledWith({
        where: { company: { id: mockCompany.id } },
        order: { performedAt: 'DESC' },
      });
    });

    it('should return empty array when company has no history', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findByCompany('company-without-history');

      expect(result).toEqual([]);
    });

    it('should call repository with correct company ID', async () => {
      repository.find.mockResolvedValue([]);

      await service.findByCompany('test-company-id');

      expect(repository.find).toHaveBeenCalledWith({
        where: { company: { id: 'test-company-id' } },
        order: { performedAt: 'DESC' },
      });
    });
  });

  describe('findAll', () => {
    it('should return all history when no filters provided', async () => {
      const histories = [mockHistory];
      repository.find.mockResolvedValue(histories as any);

      const result = await service.findAll({});

      expect(result).toEqual(histories);
      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        order: { performedAt: 'DESC' },
      });
    });

    it('should filter by company ID', async () => {
      repository.find.mockResolvedValue([mockHistory] as any);

      await service.findAll({ companyId: mockCompany.id });

      expect(repository.find).toHaveBeenCalledWith({
        where: { company: { id: mockCompany.id } },
        order: { performedAt: 'DESC' },
      });
    });

    it('should filter by IP ID', async () => {
      repository.find.mockResolvedValue([mockHistory] as any);

      await service.findAll({ ipId: mockIp.id });

      expect(repository.find).toHaveBeenCalledWith({
        where: { ip: { id: mockIp.id } },
        order: { performedAt: 'DESC' },
      });
    });

    it('should filter by action', async () => {
      repository.find.mockResolvedValue([mockHistory] as any);

      await service.findAll({ action: IpAction.ASSIGNED });

      expect(repository.find).toHaveBeenCalledWith({
        where: { action: IpAction.ASSIGNED },
        order: { performedAt: 'DESC' },
      });
    });

    it('should filter by date range (startDate and endDate)', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      repository.find.mockResolvedValue([mockHistory] as any);

      await service.findAll({ startDate, endDate });

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          performedAt: Between(new Date(startDate), new Date(endDate)),
        },
        order: { performedAt: 'DESC' },
      });
    });

    it('should filter by startDate only', async () => {
      const startDate = '2024-01-01';
      repository.find.mockResolvedValue([mockHistory] as any);

      await service.findAll({ startDate });

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          performedAt: Between(new Date(startDate), new Date('2100-12-31')),
        },
        order: { performedAt: 'DESC' },
      });
    });

    it('should filter by endDate only', async () => {
      const endDate = '2024-12-31';
      repository.find.mockResolvedValue([mockHistory] as any);

      await service.findAll({ endDate });

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          performedAt: Between(new Date('1900-01-01'), new Date(endDate)),
        },
        order: { performedAt: 'DESC' },
      });
    });

    it('should combine multiple filters', async () => {
      repository.find.mockResolvedValue([mockHistory] as any);

      await service.findAll({
        companyId: mockCompany.id,
        action: IpAction.ASSIGNED,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          company: { id: mockCompany.id },
          action: IpAction.ASSIGNED,
          performedAt: Between(new Date('2024-01-01'), new Date('2024-12-31')),
        },
        order: { performedAt: 'DESC' },
      });
    });
  });

  describe('getIpDetailedHistory', () => {
    it('should return detailed history for IP address', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockHistory]),
      };

      repository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.getIpDetailedHistory('10.0.0.100');

      expect(result).toEqual([mockHistory]);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('history');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('history.ip', 'ip');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('history.company', 'company');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('history.performedBy', 'performedBy');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('ip.address = :ipAddress', {
        ipAddress: '10.0.0.100',
      });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('history.performedAt', 'DESC');
    });

    it('should return empty array when IP address has no history', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      repository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const result = await service.getIpDetailedHistory('10.0.0.999');

      expect(result).toEqual([]);
    });

    it('should use correct IP address in query', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      repository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      await service.getIpDetailedHistory('192.168.1.50');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('ip.address = :ipAddress', {
        ipAddress: '192.168.1.50',
      });
    });
  });
});