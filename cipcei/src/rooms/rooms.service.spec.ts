import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { Company } from '../companies/entities/company.entity';

describe('RoomsService', () => {
  let service: RoomsService;
  let repository: jest.Mocked<Repository<Room>>;

  const mockCompany: Company = {
    id: 'company-uuid-123',
    user: null as any,
    room: null as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  };

  const mockRoom: Room = {
    id: 'room-uuid-123',
    number: 101,
    companies: [mockCompany],
    ips: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: getRepositoryToken(Room),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    repository = module.get(getRepositoryToken(Room)) as jest.Mocked<Repository<Room>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createRoomDto: CreateRoomDto = {
      number: 101,
    };

    it('should successfully create a new room', async () => {
      repository.create.mockReturnValue(mockRoom);
      repository.save.mockResolvedValue(mockRoom);

      const result = await service.create(createRoomDto);

      expect(result).toEqual(mockRoom);
      expect(repository.create).toHaveBeenCalledWith({ number: createRoomDto.number });
      expect(repository.save).toHaveBeenCalledWith(mockRoom);
    });

    it('should call repository.create with room number', async () => {
      repository.create.mockReturnValue(mockRoom);
      repository.save.mockResolvedValue(mockRoom);

      await service.create(createRoomDto);

      expect(repository.create).toHaveBeenCalledWith({ number: 101 });
    });

    it('should call repository.save with created room', async () => {
      const createdRoom = { ...mockRoom };
      repository.create.mockReturnValue(createdRoom);
      repository.save.mockResolvedValue(createdRoom);

      await service.create(createRoomDto);

      expect(repository.save).toHaveBeenCalledWith(createdRoom);
    });

    it('should create room with different room numbers', async () => {
      const dto = { number: 205 };
      const room = { ...mockRoom, number: 205 };
      repository.create.mockReturnValue(room);
      repository.save.mockResolvedValue(room);

      const result = await service.create(dto);

      expect(result.number).toBe(205);
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database error');
      repository.create.mockReturnValue(mockRoom);
      repository.save.mockRejectedValue(error);

      await expect(service.create(createRoomDto)).rejects.toThrow('Database error');
    });

    it('should handle unique constraint violations', async () => {
      const uniqueError = new Error('duplicate key value violates unique constraint');
      repository.create.mockReturnValue(mockRoom);
      repository.save.mockRejectedValue(uniqueError);

      await expect(service.create(createRoomDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all rooms with companies', async () => {
      repository.find.mockResolvedValue([mockRoom]);

      const result = await service.findAll();

      expect(result).toEqual([mockRoom]);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['companies', 'companies.user'],
      });
    });

    it('should return empty array when no rooms exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a room by id', async () => {
      repository.findOne.mockResolvedValue(mockRoom);

      const result = await service.findOne(mockRoom.id);

      expect(result).toEqual(mockRoom);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockRoom.id },
        relations: ['companies', 'companies.user', 'ips'],
      });
    });

    it('should throw NotFoundException when room not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        new NotFoundException('Sala com ID "non-existent-id" não encontrada'),
      );
    });
  });

  describe('getCompanies', () => {
    it('should return companies for a room', async () => {
      repository.findOne.mockResolvedValue(mockRoom);

      const result = await service.getCompanies(mockRoom.id);

      expect(result).toEqual(mockRoom.companies);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockRoom.id },
        relations: ['companies', 'companies.user'],
      });
    });

    it('should throw NotFoundException when room not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getCompanies('non-existent-id')).rejects.toThrow(
        new NotFoundException('Sala com ID "non-existent-id" não encontrada'),
      );
    });

    it('should return empty array for room with no companies', async () => {
      const roomWithNoCompanies = { ...mockRoom, companies: [] };
      repository.findOne.mockResolvedValue(roomWithNoCompanies);

      const result = await service.getCompanies(mockRoom.id);

      expect(result).toEqual([]);
    });
  });
});
