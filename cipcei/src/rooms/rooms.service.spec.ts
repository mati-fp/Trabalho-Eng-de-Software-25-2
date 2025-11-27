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

  const mockUser = {
    id: 'user-uuid-456',
    name: 'Company User',
  };

  const mockCompany: Company = {
    id: 'company-uuid-123',
    user: mockUser as any,
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

    it('should successfully create a new room and return DTO', async () => {
      repository.create.mockReturnValue(mockRoom);
      repository.save.mockResolvedValue(mockRoom);
      repository.findOne.mockResolvedValue(mockRoom);

      const result = await service.create(createRoomDto);

      // Retorna DTO
      expect(result.id).toBe(mockRoom.id);
      expect(result.number).toBe(101);
      expect(result.companies).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith({ number: createRoomDto.number });
      expect(repository.save).toHaveBeenCalledWith(mockRoom);
    });

    it('should call repository.create with room number', async () => {
      repository.create.mockReturnValue(mockRoom);
      repository.save.mockResolvedValue(mockRoom);
      repository.findOne.mockResolvedValue(mockRoom);

      await service.create(createRoomDto);

      expect(repository.create).toHaveBeenCalledWith({ number: 101 });
    });

    it('should call repository.save with created room', async () => {
      const createdRoom = { ...mockRoom };
      repository.create.mockReturnValue(createdRoom);
      repository.save.mockResolvedValue(createdRoom);
      repository.findOne.mockResolvedValue(createdRoom);

      await service.create(createRoomDto);

      expect(repository.save).toHaveBeenCalledWith(createdRoom);
    });

    it('should create room with different room numbers', async () => {
      const dto = { number: 205 };
      const room = { ...mockRoom, number: 205 };
      repository.create.mockReturnValue(room);
      repository.save.mockResolvedValue(room);
      repository.findOne.mockResolvedValue(room);

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
    it('should return all rooms as DTOs with companies', async () => {
      repository.find.mockResolvedValue([mockRoom]);

      const result = await service.findAll();

      // Verifica DTO
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockRoom.id);
      expect(result[0].number).toBe(mockRoom.number);
      expect(result[0].companies).toBeDefined();
      expect(result[0].companies![0].id).toBe(mockCompany.id);
      expect(result[0].companies![0].user.name).toBe('Company User');
      expect(result[0].companies![0].roomNumber).toBe(101);
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
    it('should return a room as DTO by id', async () => {
      repository.findOne.mockResolvedValue(mockRoom);

      const result = await service.findOne(mockRoom.id);

      // Verifica DTO
      expect(result.id).toBe(mockRoom.id);
      expect(result.number).toBe(mockRoom.number);
      expect(result.companies).toBeDefined();
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
    it('should return companies as DTOs for a room', async () => {
      repository.findOne.mockResolvedValue(mockRoom);

      const result = await service.getCompanies(mockRoom.id);

      // Verifica DTO de companies
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockCompany.id);
      expect(result[0].user.name).toBe('Company User');
      expect(result[0].roomNumber).toBe(101);
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

  describe('getSummary', () => {
    it('should return rooms with hasCompanies and companiesCount', async () => {
      const roomWithCompanies = { id: 'room-1', number: 106, companies: [mockCompany], ips: [] };
      const roomWithoutCompanies = { id: 'room-2', number: 108, companies: [], ips: [] };
      repository.find.mockResolvedValue([roomWithCompanies, roomWithoutCompanies]);

      const result = await service.getSummary();

      expect(result).toEqual([
        { id: 'room-1', number: 106, hasCompanies: true, companiesCount: 1 },
        { id: 'room-2', number: 108, hasCompanies: false, companiesCount: 0 },
      ]);
    });

    it('should return empty array when no rooms exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.getSummary();

      expect(result).toEqual([]);
    });

    it('should order rooms by number ascending', async () => {
      repository.find.mockResolvedValue([]);

      await service.getSummary();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['companies'],
        order: { number: 'ASC' },
      });
    });

    it('should return correct number in DTO', async () => {
      const room = { id: 'room-1', number: 205, companies: [], ips: [] };
      repository.find.mockResolvedValue([room]);

      const result = await service.getSummary();

      expect(result[0].number).toBe(205);
    });

    it('should handle multiple companies in a room', async () => {
      const company2 = { ...mockCompany, id: 'company-2' };
      const roomWithMultiple = { id: 'room-1', number: 100, companies: [mockCompany, company2], ips: [] };
      repository.find.mockResolvedValue([roomWithMultiple]);

      const result = await service.getSummary();

      expect(result[0].hasCompanies).toBe(true);
      expect(result[0].companiesCount).toBe(2);
    });
  });
});
