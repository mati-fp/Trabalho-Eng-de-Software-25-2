import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UserRole } from '../users/entities/user.entity';
import { IpStatus } from '../ips/entities/ip.entity';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let companiesService: jest.Mocked<CompaniesService>;

  const mockCompany = {
    id: 'company-uuid-123',
    user: {
      id: 'user-uuid-456',
      email: 'company@test.com',
      name: 'Company User',
      role: UserRole.COMPANY,
    },
    room: {
      id: 'room-uuid-789',
      roomNumber: 101,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockIp = {
    id: 'ip-uuid-001',
    address: '10.0.0.100',
    macAddress: 'AA:BB:CC:DD:EE:FF',
    isTemporary: false,
    status: IpStatus.IN_USE,
    assignedAt: new Date(),
  };

  const mockRequest = {
    user: {
      id: 'user-uuid-456',
      email: 'company@test.com',
      company: {
        id: 'company-uuid-123',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getAllMyIps: jest.fn(),
            getActiveIps: jest.fn(),
            getRenewableIps: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    companiesService = module.get(CompaniesService) as jest.Mocked<CompaniesService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyCompany', () => {
    it('should return the company profile for the logged-in company user', async () => {
      companiesService.findOne.mockResolvedValue(mockCompany as any);

      const result = await controller.getMyCompany(mockRequest);

      expect(result).toEqual(mockCompany);
      expect(companiesService.findOne).toHaveBeenCalledWith(mockRequest.user.company.id);
    });

    it('should use company ID from JWT token', async () => {
      companiesService.findOne.mockResolvedValue(mockCompany as any);

      await controller.getMyCompany(mockRequest);

      expect(companiesService.findOne).toHaveBeenCalledWith('company-uuid-123');
    });
  });

  describe('getMyActiveIps', () => {
    it('should return active IPs for the logged-in company', async () => {
      const activeIps = [mockIp];
      companiesService.getActiveIps.mockResolvedValue(activeIps as any);

      const result = await controller.getMyActiveIps(mockRequest);

      expect(result).toEqual(activeIps);
      expect(companiesService.getActiveIps).toHaveBeenCalledWith(mockRequest.user.company.id);
    });

    it('should return empty array when no active IPs exist', async () => {
      companiesService.getActiveIps.mockResolvedValue([]);

      const result = await controller.getMyActiveIps(mockRequest);

      expect(result).toEqual([]);
    });
  });

  describe('getMyRenewableIps', () => {
    it('should return renewable IPs for the logged-in company', async () => {
      const renewableIp = { ...mockIp, isTemporary: true, status: IpStatus.EXPIRED };
      companiesService.getRenewableIps.mockResolvedValue([renewableIp] as any);

      const result = await controller.getMyRenewableIps(mockRequest);

      expect(result).toEqual([renewableIp]);
      expect(companiesService.getRenewableIps).toHaveBeenCalledWith(
        mockRequest.user.company.id,
      );
    });

    it('should use company ID from JWT token', async () => {
      companiesService.getRenewableIps.mockResolvedValue([]);

      await controller.getMyRenewableIps(mockRequest);

      expect(companiesService.getRenewableIps).toHaveBeenCalledWith('company-uuid-123');
    });
  });

  describe('getMyIps', () => {
    it('should return all IPs for the logged-in company', async () => {
      const allIps = [mockIp, { ...mockIp, id: 'ip-uuid-002', status: IpStatus.EXPIRED }];
      companiesService.getAllMyIps.mockResolvedValue(allIps as any);

      const result = await controller.getMyIps(mockRequest);

      expect(result).toEqual(allIps);
      expect(companiesService.getAllMyIps).toHaveBeenCalledWith(mockRequest.user.company.id);
    });

    it('should include both active and expired IPs', async () => {
      const mixedIps = [
        { ...mockIp, status: IpStatus.IN_USE },
        { ...mockIp, id: 'ip-2', status: IpStatus.EXPIRED },
      ];
      companiesService.getAllMyIps.mockResolvedValue(mixedIps as any);

      const result = await controller.getMyIps(mockRequest);

      expect(result.length).toBe(2);
    });
  });

  describe('findAll', () => {
    it('should return all companies for admin', async () => {
      const companies = [mockCompany];
      companiesService.findAll.mockResolvedValue(companies as any);

      const result = await controller.findAll();

      expect(result).toEqual(companies);
      expect(companiesService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no companies exist', async () => {
      companiesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

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
      roomId: 'room-uuid-789',
    };

    it('should create a new company', async () => {
      const newCompany = { ...mockCompany, ...createDto };
      companiesService.create.mockResolvedValue(newCompany as any);

      const result = await controller.create(createDto);

      expect(result).toEqual(newCompany);
      expect(companiesService.create).toHaveBeenCalledWith(createDto);
    });

    it('should call companiesService.create with correct parameters', async () => {
      companiesService.create.mockResolvedValue(mockCompany as any);

      await controller.create(createDto);

      expect(companiesService.create).toHaveBeenCalledWith({
        user: createDto.user,
        roomId: createDto.roomId,
      });
    });

    it('should propagate errors from companiesService', async () => {
      const error = new Error('Database error');
      companiesService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should find a company by ID', async () => {
      companiesService.findOne.mockResolvedValue(mockCompany as any);

      const result = await controller.findOne(mockCompany.id);

      expect(result).toEqual(mockCompany);
      expect(companiesService.findOne).toHaveBeenCalledWith(mockCompany.id);
    });

    it('should throw NotFoundException when company does not exist', async () => {
      companiesService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        new NotFoundException('Empresa com ID "non-existent-id" nao encontrada'),
      );
    });

    it('should return company when it exists', async () => {
      companiesService.findOne.mockResolvedValue(mockCompany as any);

      const result = await controller.findOne(mockCompany.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockCompany.id);
    });
  });

  describe('getCompanyIps', () => {
    it('should return all IPs for a specific company', async () => {
      const ips = [mockIp];
      companiesService.getAllMyIps.mockResolvedValue(ips as any);

      const result = await controller.getCompanyIps(mockCompany.id);

      expect(result).toEqual(ips);
      expect(companiesService.getAllMyIps).toHaveBeenCalledWith(mockCompany.id);
    });

    it('should work with any company ID', async () => {
      companiesService.getAllMyIps.mockResolvedValue([]);

      await controller.getCompanyIps('any-company-id');

      expect(companiesService.getAllMyIps).toHaveBeenCalledWith('any-company-id');
    });
  });

  describe('update', () => {
    const updateDto: UpdateCompanyDto = {};

    it('should update a company', async () => {
      const updatedCompany = { ...mockCompany };
      companiesService.update.mockResolvedValue(updatedCompany as any);

      const result = await controller.update(mockCompany.id, updateDto);

      expect(result).toEqual(updatedCompany);
      expect(companiesService.update).toHaveBeenCalledWith(mockCompany.id, updateDto);
    });

    it('should propagate NotFoundException from service', async () => {
      companiesService.update.mockRejectedValue(
        new NotFoundException('Company not found'),
      );

      await expect(controller.update('non-existent-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should call companiesService.update with correct parameters', async () => {
      companiesService.update.mockResolvedValue(mockCompany as any);

      await controller.update('test-id', updateDto);

      expect(companiesService.update).toHaveBeenCalledWith('test-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a company', async () => {
      companiesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockCompany.id);

      expect(result).toBeUndefined();
      expect(companiesService.remove).toHaveBeenCalledWith(mockCompany.id);
    });

    it('should propagate NotFoundException from service', async () => {
      companiesService.remove.mockRejectedValue(
        new NotFoundException('Company not found'),
      );

      await expect(controller.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should call companiesService.remove with correct ID', async () => {
      companiesService.remove.mockResolvedValue(undefined);

      await controller.remove('test-id');

      expect(companiesService.remove).toHaveBeenCalledWith('test-id');
    });
  });
});