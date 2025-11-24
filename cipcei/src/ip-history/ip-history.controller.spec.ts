import { Test, TestingModule } from '@nestjs/testing';
import { IpHistoryController } from './ip-history.controller';
import { IpHistoryService } from './ip-history.service';
import { IpAction } from './entities/ip-history.entity';
import { FindIpHistoryDto } from './dto/find-ip-history.dto';

describe('IpHistoryController', () => {
  let controller: IpHistoryController;
  let service: jest.Mocked<IpHistoryService>;

  const mockHistory = {
    id: 'history-uuid-111',
    ip: {
      id: 'ip-uuid-001',
      address: '10.0.0.100',
    },
    company: {
      id: 'company-uuid-456',
      name: 'Test Company',
    },
    action: IpAction.ASSIGNED,
    performedBy: {
      id: 'user-uuid-123',
      name: 'Admin',
    },
    performedAt: new Date('2024-01-01'),
    macAddress: 'AA:BB:CC:DD:EE:FF',
    userName: 'Test User',
    notes: 'IP assigned',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IpHistoryController],
      providers: [
        {
          provide: IpHistoryService,
          useValue: {
            findAll: jest.fn(),
            findByCompany: jest.fn(),
            findByIp: jest.fn(),
            getIpDetailedHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IpHistoryController>(IpHistoryController);
    service = module.get(IpHistoryService) as jest.Mocked<IpHistoryService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all history without filters', async () => {
      const histories = [mockHistory];
      service.findAll.mockResolvedValue(histories as any);

      const result = await controller.findAll({});

      expect(result).toEqual(histories);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should return history filtered by company ID', async () => {
      const filters: FindIpHistoryDto = {
        companyId: 'company-uuid-456',
      };
      service.findAll.mockResolvedValue([mockHistory] as any);

      const result = await controller.findAll(filters);

      expect(result).toEqual([mockHistory]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return history filtered by IP ID', async () => {
      const filters: FindIpHistoryDto = {
        ipId: 'ip-uuid-001',
      };
      service.findAll.mockResolvedValue([mockHistory] as any);

      const result = await controller.findAll(filters);

      expect(result).toEqual([mockHistory]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return history filtered by action', async () => {
      const filters: FindIpHistoryDto = {
        action: IpAction.ASSIGNED,
      };
      service.findAll.mockResolvedValue([mockHistory] as any);

      const result = await controller.findAll(filters);

      expect(result).toEqual([mockHistory]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return history filtered by date range', async () => {
      const filters: FindIpHistoryDto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };
      service.findAll.mockResolvedValue([mockHistory] as any);

      const result = await controller.findAll(filters);

      expect(result).toEqual([mockHistory]);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return history with multiple filters combined', async () => {
      const filters: FindIpHistoryDto = {
        companyId: 'company-uuid-456',
        action: IpAction.RENEWED,
        startDate: '2024-01-01',
      };
      service.findAll.mockResolvedValue([mockHistory] as any);

      await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return empty array when no history matches filters', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll({ companyId: 'nonexistent' });

      expect(result).toEqual([]);
    });
  });

  describe('getCompanyHistory', () => {
    it('should return history for specific company', async () => {
      const histories = [mockHistory];
      service.findByCompany.mockResolvedValue(histories as any);

      const result = await controller.getCompanyHistory('company-uuid-456');

      expect(result).toEqual(histories);
      expect(service.findByCompany).toHaveBeenCalledWith('company-uuid-456');
    });

    it('should call service with correct company ID', async () => {
      service.findByCompany.mockResolvedValue([]);

      await controller.getCompanyHistory('test-company-id');

      expect(service.findByCompany).toHaveBeenCalledWith('test-company-id');
      expect(service.findByCompany).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when company has no history', async () => {
      service.findByCompany.mockResolvedValue([]);

      const result = await controller.getCompanyHistory('company-without-history');

      expect(result).toEqual([]);
    });

    it('should handle multiple history entries', async () => {
      const multipleHistories = [
        mockHistory,
        { ...mockHistory, action: IpAction.RENEWED },
        { ...mockHistory, action: IpAction.RELEASED },
      ];
      service.findByCompany.mockResolvedValue(multipleHistories as any);

      const result = await controller.getCompanyHistory('company-uuid-456');

      expect(result).toHaveLength(3);
      expect(result).toEqual(multipleHistories);
    });
  });

  describe('getIpHistory', () => {
    it('should return history for specific IP', async () => {
      const histories = [mockHistory];
      service.findByIp.mockResolvedValue(histories as any);

      const result = await controller.getIpHistory('ip-uuid-001');

      expect(result).toEqual(histories);
      expect(service.findByIp).toHaveBeenCalledWith('ip-uuid-001');
    });

    it('should call service with correct IP ID', async () => {
      service.findByIp.mockResolvedValue([]);

      await controller.getIpHistory('test-ip-id');

      expect(service.findByIp).toHaveBeenCalledWith('test-ip-id');
      expect(service.findByIp).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when IP has no history', async () => {
      service.findByIp.mockResolvedValue([]);

      const result = await controller.getIpHistory('ip-without-history');

      expect(result).toEqual([]);
    });

    it('should handle IP with multiple history entries', async () => {
      const ipHistories = [
        { ...mockHistory, action: IpAction.ASSIGNED },
        { ...mockHistory, action: IpAction.RENEWED },
        { ...mockHistory, action: IpAction.RELEASED },
      ];
      service.findByIp.mockResolvedValue(ipHistories as any);

      const result = await controller.getIpHistory('ip-uuid-001');

      expect(result).toHaveLength(3);
    });
  });

  describe('getIpDetailedHistory', () => {
    it('should return detailed history for IP address', async () => {
      const histories = [mockHistory];
      service.getIpDetailedHistory.mockResolvedValue(histories as any);

      const result = await controller.getIpDetailedHistory('10.0.0.100');

      expect(result).toEqual(histories);
      expect(service.getIpDetailedHistory).toHaveBeenCalledWith('10.0.0.100');
    });

    it('should call service with correct IP address', async () => {
      service.getIpDetailedHistory.mockResolvedValue([]);

      await controller.getIpDetailedHistory('192.168.1.50');

      expect(service.getIpDetailedHistory).toHaveBeenCalledWith('192.168.1.50');
      expect(service.getIpDetailedHistory).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when IP address has no history', async () => {
      service.getIpDetailedHistory.mockResolvedValue([]);

      const result = await controller.getIpDetailedHistory('10.0.0.999');

      expect(result).toEqual([]);
    });

    it('should handle detailed history with all relations', async () => {
      const detailedHistory = {
        ...mockHistory,
        ip: { id: 'ip-uuid-001', address: '10.0.0.100', status: 'IN_USE' },
        company: { id: 'company-uuid-456', name: 'Test Company', room: { number: 101 } },
        performedBy: { id: 'user-uuid-123', name: 'Admin', email: 'admin@test.com' },
      };
      service.getIpDetailedHistory.mockResolvedValue([detailedHistory] as any);

      const result = await controller.getIpDetailedHistory('10.0.0.100');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('ip');
      expect(result[0]).toHaveProperty('company');
      expect(result[0]).toHaveProperty('performedBy');
    });

    it('should handle different IP address formats', async () => {
      service.getIpDetailedHistory.mockResolvedValue([mockHistory] as any);

      await controller.getIpDetailedHistory('172.16.254.1');

      expect(service.getIpDetailedHistory).toHaveBeenCalledWith('172.16.254.1');
    });
  });
});