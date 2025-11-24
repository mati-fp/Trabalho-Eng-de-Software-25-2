import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { IpsService } from '../ips/ips.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { BulkCreateIpDto } from '../ips/dto/bulk-create-ip.dto';

describe('RoomsController', () => {
  let controller: RoomsController;
  let roomsService: jest.Mocked<RoomsService>;
  let ipsService: jest.Mocked<IpsService>;

  const mockRoom = {
    id: 'room-uuid-123',
    number: 101,
    company: null,
    ips: [],
  };

  const mockIp = {
    id: 'ip-uuid-001',
    address: '10.0.0.100',
    status: 'available',
    room: mockRoom,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: IpsService,
          useValue: {
            bulkCreate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
    roomsService = module.get(RoomsService) as jest.Mocked<RoomsService>;
    ipsService = module.get(IpsService) as jest.Mocked<IpsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createRoomDto: CreateRoomDto = {
      number: 101,
    };

    it('should create a new room', async () => {
      roomsService.create.mockResolvedValue(mockRoom as any);

      const result = await controller.create(createRoomDto);

      expect(result).toEqual(mockRoom);
      expect(roomsService.create).toHaveBeenCalledWith(createRoomDto);
    });

    it('should call roomsService.create with correct parameters', async () => {
      roomsService.create.mockResolvedValue(mockRoom as any);

      await controller.create(createRoomDto);

      expect(roomsService.create).toHaveBeenCalledWith({ number: 101 });
      expect(roomsService.create).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from roomsService', async () => {
      const error = new Error('Database error');
      roomsService.create.mockRejectedValue(error);

      await expect(controller.create(createRoomDto)).rejects.toThrow('Database error');
    });

    it('should create room with different room numbers', async () => {
      const dto = { number: 205 };
      const room = { ...mockRoom, number: 205 };
      roomsService.create.mockResolvedValue(room as any);

      const result = await controller.create(dto);

      expect(result.number).toBe(205);
    });
  });

  describe('addIps', () => {
    const roomId = 'room-uuid-123';
    const bulkCreateIpDto: BulkCreateIpDto = {
      ips: [
        { address: '10.0.0.100' },
        { address: '10.0.0.101' },
      ],
    };

    it('should add multiple IPs to a room', async () => {
      const createdIps = [
        { ...mockIp, address: '10.0.0.100' },
        { ...mockIp, id: 'ip-uuid-002', address: '10.0.0.101' },
      ];
      ipsService.bulkCreate.mockResolvedValue(createdIps as any);

      const result = await controller.addIps(roomId, bulkCreateIpDto);

      expect(result).toEqual(createdIps);
      expect(ipsService.bulkCreate).toHaveBeenCalledWith(roomId, bulkCreateIpDto.ips);
    });

    it('should call ipsService.bulkCreate with correct parameters', async () => {
      ipsService.bulkCreate.mockResolvedValue([]);

      await controller.addIps(roomId, bulkCreateIpDto);

      expect(ipsService.bulkCreate).toHaveBeenCalledWith('room-uuid-123', [
        { address: '10.0.0.100' },
        { address: '10.0.0.101' },
      ]);
    });

    it('should return array of created IPs', async () => {
      const createdIps = [mockIp, mockIp];
      ipsService.bulkCreate.mockResolvedValue(createdIps as any);

      const result = await controller.addIps(roomId, bulkCreateIpDto);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('should propagate errors from ipsService', async () => {
      const error = new Error('Room not found');
      ipsService.bulkCreate.mockRejectedValue(error);

      await expect(controller.addIps(roomId, bulkCreateIpDto)).rejects.toThrow('Room not found');
    });

    it('should handle empty IPs array', async () => {
      const emptyDto = { ips: [] };
      ipsService.bulkCreate.mockResolvedValue([]);

      const result = await controller.addIps(roomId, emptyDto);

      expect(result).toEqual([]);
    });
  });
});
