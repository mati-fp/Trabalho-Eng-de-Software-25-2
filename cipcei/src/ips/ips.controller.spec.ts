import { Test, TestingModule } from '@nestjs/testing';
import { IpsController } from './ips.controller';
import { IpsService } from './ips.service';
import { IpStatus } from './entities/ip.entity';
import { AssignIpDto } from './dto/assign-ip.dto';
import { FindAllIpsDto } from './dto/find-all-ips.dto';
import { UserRole } from '../users/entities/user.entity';

describe('IpsController', () => {
  let controller: IpsController;
  let ipsService: jest.Mocked<IpsService>;

  const mockIp = {
    id: 'ip-uuid-001',
    address: '10.0.0.100',
    status: IpStatus.AVAILABLE,
    macAddress: '',
    room: {
      id: 'room-uuid-123',
      number: 101,
    },
  };

  const mockAdminUser = {
    id: 'admin-uuid-999',
    email: 'admin@cei.ufrgs.br',
    name: 'Admin User',
    role: UserRole.ADMIN,
  };

  const mockRequest = {
    user: mockAdminUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IpsController],
      providers: [
        {
          provide: IpsService,
          useValue: {
            findAll: jest.fn(),
            assign: jest.fn(),
            unassign: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IpsController>(IpsController);
    ipsService = module.get(IpsService) as jest.Mocked<IpsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('assign', () => {
    const assignIpDto: AssignIpDto = {
      macAddress: 'AA:BB:CC:DD:EE:FF',
      companyId: 'company-uuid-456',
    };

    it('should assign IP to company', async () => {
      const assignedIp = { ...mockIp, status: IpStatus.IN_USE, macAddress: assignIpDto.macAddress };
      ipsService.assign.mockResolvedValue(assignedIp as any);

      const result = await controller.assign(mockIp.id, assignIpDto, mockRequest);

      expect(result).toEqual(assignedIp);
      expect(ipsService.assign).toHaveBeenCalledWith(mockIp.id, assignIpDto, mockAdminUser);
    });

    it('should call ipsService.assign with correct parameters', async () => {
      ipsService.assign.mockResolvedValue(mockIp as any);

      await controller.assign('test-ip-id', assignIpDto, mockRequest);

      expect(ipsService.assign).toHaveBeenCalledWith('test-ip-id', {
        macAddress: assignIpDto.macAddress,
        companyId: assignIpDto.companyId,
      }, mockAdminUser);
    });

    it('should propagate errors from ipsService', async () => {
      const error = new Error('IP not found');
      ipsService.assign.mockRejectedValue(error);

      await expect(controller.assign(mockIp.id, assignIpDto, mockRequest)).rejects.toThrow('IP not found');
    });
  });

  describe('findAll', () => {
    it('should return all IPs without filters', async () => {
      const ips = [mockIp];
      ipsService.findAll.mockResolvedValue(ips as any);

      const result = await controller.findAll({});

      expect(result).toEqual(ips);
      expect(ipsService.findAll).toHaveBeenCalledWith({});
    });

    it('should return IPs filtered by status', async () => {
      const filters: FindAllIpsDto = {
        status: IpStatus.AVAILABLE,
      };
      const availableIps = [mockIp];
      ipsService.findAll.mockResolvedValue(availableIps as any);

      const result = await controller.findAll(filters);

      expect(result).toEqual(availableIps);
      expect(ipsService.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return IPs filtered by company name', async () => {
      const filters: FindAllIpsDto = {
        companyName: 'Test Company',
      };
      ipsService.findAll.mockResolvedValue([mockIp] as any);

      await controller.findAll(filters);

      expect(ipsService.findAll).toHaveBeenCalledWith({ companyName: 'Test Company' });
    });

    it('should return IPs filtered by room number', async () => {
      const filters: FindAllIpsDto = {
        roomNumber: 101,
      };
      ipsService.findAll.mockResolvedValue([mockIp] as any);

      await controller.findAll(filters);

      expect(ipsService.findAll).toHaveBeenCalledWith({ roomNumber: 101 });
    });

    it('should handle multiple filters', async () => {
      const filters: FindAllIpsDto = {
        status: IpStatus.IN_USE,
        companyName: 'Test',
        roomNumber: 101,
      };
      ipsService.findAll.mockResolvedValue([mockIp] as any);

      await controller.findAll(filters);

      expect(ipsService.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('unassign', () => {
    it('should unassign IP from company', async () => {
      const unassignedIp = { ...mockIp, status: IpStatus.AVAILABLE, macAddress: '' };
      ipsService.unassign.mockResolvedValue(unassignedIp as any);

      const result = await controller.unassign(mockIp.id, mockRequest);

      expect(result).toEqual(unassignedIp);
      expect(ipsService.unassign).toHaveBeenCalledWith(mockIp.id, mockAdminUser);
    });

    it('should call ipsService.unassign with correct IP ID', async () => {
      ipsService.unassign.mockResolvedValue(mockIp as any);

      await controller.unassign('test-ip-id', mockRequest);

      expect(ipsService.unassign).toHaveBeenCalledWith('test-ip-id', mockAdminUser);
      expect(ipsService.unassign).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from ipsService', async () => {
      const error = new Error('IP not found');
      ipsService.unassign.mockRejectedValue(error);

      await expect(controller.unassign('invalid-id', mockRequest)).rejects.toThrow('IP not found');
    });
  });
});
