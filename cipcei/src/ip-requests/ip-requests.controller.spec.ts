import { Test, TestingModule } from '@nestjs/testing';
import { IpRequestsController } from './ip-requests.controller';
import { IpRequestsService } from './ip-requests.service';
import { IpRequestType, IpRequestStatus } from './entities/ip-request.entity';
import { UserRole } from '../users/entities/user.entity';
import { CreateIpRequestDto } from './dto/create-ip-request.dto';
import { ApproveIpRequestDto } from './dto/approve-ip-request.dto';
import { RejectIpRequestDto } from './dto/reject-ip-request.dto';

describe('IpRequestsController', () => {
  let controller: IpRequestsController;
  let service: jest.Mocked<IpRequestsService>;

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

  const mockRequest = {
    id: 'request-uuid-999',
    requestType: IpRequestType.NEW,
    status: IpRequestStatus.PENDING,
    company: { id: 'company-uuid-456' },
    requestedBy: mockUser,
    justification: 'Test request',
    requestDate: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IpRequestsController],
      providers: [
        {
          provide: IpRequestsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByCompany: jest.fn(),
            findPending: jest.fn(),
            findOne: jest.fn(),
            cancel: jest.fn(),
            approve: jest.fn(),
            reject: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IpRequestsController>(IpRequestsController);
    service = module.get(IpRequestsService) as jest.Mocked<IpRequestsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create (Company)', () => {
    const createDto: CreateIpRequestDto = {
      requestType: IpRequestType.NEW,
      justification: 'Need new IP for testing',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      userName: 'Test User',
    };

    it('should create a new IP request', async () => {
      const req = { user: mockUser };
      service.create.mockResolvedValue(mockRequest as any);

      const result = await controller.create(createDto, req);

      expect(result).toEqual(mockRequest);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser);
    });

    it('should call service with correct parameters for RENEWAL', async () => {
      const renewalDto = {
        ...createDto,
        requestType: IpRequestType.RENEWAL,
        ipId: 'ip-uuid-001',
      };
      const req = { user: mockUser };
      service.create.mockResolvedValue(mockRequest as any);

      await controller.create(renewalDto, req);

      expect(service.create).toHaveBeenCalledWith(renewalDto, mockUser);
    });

    it('should call service with correct parameters for CANCELLATION', async () => {
      const cancellationDto = {
        ...createDto,
        requestType: IpRequestType.CANCELLATION,
        ipId: 'ip-uuid-001',
      };
      const req = { user: mockUser };
      service.create.mockResolvedValue(mockRequest as any);

      await controller.create(cancellationDto, req);

      expect(service.create).toHaveBeenCalledWith(cancellationDto, mockUser);
    });

    it('should propagate errors from service', async () => {
      const req = { user: mockUser };
      const error = new Error('Company has no room');
      service.create.mockRejectedValue(error);

      await expect(controller.create(createDto, req)).rejects.toThrow('Company has no room');
    });
  });

  describe('findAll (Admin)', () => {
    it('should return all IP requests', async () => {
      const requests = [mockRequest];
      service.findAll.mockResolvedValue(requests as any);

      const result = await controller.findAll();

      expect(result).toEqual(requests);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no requests exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('getMyRequests (Company)', () => {
    it('should return requests for authenticated company', async () => {
      const req = { user: mockUser };
      const companyRequests = [mockRequest];
      service.findByCompany.mockResolvedValue(companyRequests as any);

      const result = await controller.getMyRequests(req);

      expect(result).toEqual(companyRequests);
      expect(service.findByCompany).toHaveBeenCalledWith(mockUser.company.id);
    });

    it('should call service with correct company ID', async () => {
      const req = { user: { ...mockUser, company: { id: 'different-company' } } };
      service.findByCompany.mockResolvedValue([]);

      await controller.getMyRequests(req);

      expect(service.findByCompany).toHaveBeenCalledWith('different-company');
    });
  });

  describe('findPending (Admin)', () => {
    it('should return only pending requests', async () => {
      const pendingRequests = [mockRequest];
      service.findPending.mockResolvedValue(pendingRequests as any);

      const result = await controller.findPending();

      expect(result).toEqual(pendingRequests);
      expect(service.findPending).toHaveBeenCalled();
    });

    it('should return empty array when no pending requests', async () => {
      service.findPending.mockResolvedValue([]);

      const result = await controller.findPending();

      expect(result).toEqual([]);
    });
  });

  describe('findByCompany (Admin)', () => {
    it('should return requests for specific company', async () => {
      const companyRequests = [mockRequest];
      service.findByCompany.mockResolvedValue(companyRequests as any);

      const result = await controller.findByCompany('company-uuid-456');

      expect(result).toEqual(companyRequests);
      expect(service.findByCompany).toHaveBeenCalledWith('company-uuid-456');
    });

    it('should call service with correct company ID', async () => {
      service.findByCompany.mockResolvedValue([]);

      await controller.findByCompany('test-company-id');

      expect(service.findByCompany).toHaveBeenCalledWith('test-company-id');
      expect(service.findByCompany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return specific request by ID', async () => {
      service.findOne.mockResolvedValue(mockRequest as any);

      const result = await controller.findOne('request-uuid-999');

      expect(result).toEqual(mockRequest);
      expect(service.findOne).toHaveBeenCalledWith('request-uuid-999');
    });

    it('should call service with correct ID', async () => {
      service.findOne.mockResolvedValue(mockRequest as any);

      await controller.findOne('test-request-id');

      expect(service.findOne).toHaveBeenCalledWith('test-request-id');
    });

    it('should propagate NotFoundException from service', async () => {
      const error = new Error('Request not found');
      service.findOne.mockRejectedValue(error);

      await expect(controller.findOne('invalid-id')).rejects.toThrow('Request not found');
    });
  });

  describe('cancel (Company)', () => {
    it('should cancel own pending request', async () => {
      const req = { user: mockUser };
      const cancelledRequest = { ...mockRequest, status: IpRequestStatus.CANCELLED };
      service.cancel.mockResolvedValue(cancelledRequest as any);

      const result = await controller.cancel('request-uuid-999', req);

      expect(result).toEqual(cancelledRequest);
      expect(service.cancel).toHaveBeenCalledWith('request-uuid-999', mockUser);
    });

    it('should call service with correct parameters', async () => {
      const req = { user: mockUser };
      service.cancel.mockResolvedValue(mockRequest as any);

      await controller.cancel('test-request-id', req);

      expect(service.cancel).toHaveBeenCalledWith('test-request-id', mockUser);
      expect(service.cancel).toHaveBeenCalledTimes(1);
    });

    it('should propagate UnauthorizedException from service', async () => {
      const req = { user: mockUser };
      const error = new Error('Cannot cancel this request');
      service.cancel.mockRejectedValue(error);

      await expect(controller.cancel('request-uuid-999', req)).rejects.toThrow(
        'Cannot cancel this request',
      );
    });
  });

  describe('approve (Admin)', () => {
    const approveDto: ApproveIpRequestDto = {
      notes: 'Approved after review',
    };

    it('should approve pending request', async () => {
      const req = { user: mockAdmin };
      const approvedRequest = { ...mockRequest, status: IpRequestStatus.APPROVED };
      service.approve.mockResolvedValue(approvedRequest as any);

      const result = await controller.approve('request-uuid-999', approveDto, req);

      expect(result).toEqual(approvedRequest);
      expect(service.approve).toHaveBeenCalledWith('request-uuid-999', approveDto, mockAdmin);
    });

    it('should call service with correct parameters', async () => {
      const req = { user: mockAdmin };
      service.approve.mockResolvedValue(mockRequest as any);

      await controller.approve('test-request-id', approveDto, req);

      expect(service.approve).toHaveBeenCalledWith('test-request-id', approveDto, mockAdmin);
      expect(service.approve).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from service', async () => {
      const req = { user: mockAdmin };
      const error = new Error('Request already processed');
      service.approve.mockRejectedValue(error);

      await expect(controller.approve('request-uuid-999', approveDto, req)).rejects.toThrow(
        'Request already processed',
      );
    });
  });

  describe('reject (Admin)', () => {
    const rejectDto: RejectIpRequestDto = {
      rejectionReason: 'Insufficient justification',
    };

    it('should reject pending request', async () => {
      const req = { user: mockAdmin };
      const rejectedRequest = { ...mockRequest, status: IpRequestStatus.REJECTED };
      service.reject.mockResolvedValue(rejectedRequest as any);

      const result = await controller.reject('request-uuid-999', rejectDto, req);

      expect(result).toEqual(rejectedRequest);
      expect(service.reject).toHaveBeenCalledWith('request-uuid-999', rejectDto, mockAdmin);
    });

    it('should call service with correct parameters', async () => {
      const req = { user: mockAdmin };
      service.reject.mockResolvedValue(mockRequest as any);

      await controller.reject('test-request-id', rejectDto, req);

      expect(service.reject).toHaveBeenCalledWith('test-request-id', rejectDto, mockAdmin);
      expect(service.reject).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from service', async () => {
      const req = { user: mockAdmin };
      const error = new Error('Request not found');
      service.reject.mockRejectedValue(error);

      await expect(controller.reject('invalid-id', rejectDto, req)).rejects.toThrow(
        'Request not found',
      );
    });

    it('should handle rejection with different reasons', async () => {
      const req = { user: mockAdmin };
      const customRejectDto = {
        rejectionReason: 'Company exceeded IP limit',
      };
      service.reject.mockResolvedValue(mockRequest as any);

      await controller.reject('request-uuid-999', customRejectDto, req);

      expect(service.reject).toHaveBeenCalledWith('request-uuid-999', customRejectDto, mockAdmin);
    });
  });
});