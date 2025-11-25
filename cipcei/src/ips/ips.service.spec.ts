import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { IpsService } from './ips.service';
import { Ip, IpStatus } from './entities/ip.entity';
import { Room } from '../rooms/entities/room.entity';
import { Company } from '../companies/entities/company.entity';
import { CreateIpDto } from './dto/create-ip.dto';
import { AssignIpDto } from './dto/assign-ip.dto';
import { FindAllIpsDto } from './dto/find-all-ips.dto';

describe('IpsService', () => {
  let service: IpsService;
  let ipRepository: jest.Mocked<Repository<Ip>>;
  let roomRepository: jest.Mocked<Repository<Room>>;
  let companyRepository: jest.Mocked<Repository<Company>>;

  const mockRoom = {
    id: 'room-uuid-123',
    number: 101,
  };

  const mockCompany = {
    id: 'company-uuid-456',
    room: mockRoom,
  };

  const mockIp = {
    id: 'ip-uuid-001',
    address: '10.0.0.100',
    status: IpStatus.AVAILABLE,
    macAddress: '',
    room: mockRoom,
    company: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IpsService,
        {
          provide: getRepositoryToken(Ip),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Room),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Company),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IpsService>(IpsService);
    ipRepository = module.get(getRepositoryToken(Ip)) as jest.Mocked<Repository<Ip>>;
    roomRepository = module.get(getRepositoryToken(Room)) as jest.Mocked<Repository<Room>>;
    companyRepository = module.get(getRepositoryToken(Company)) as jest.Mocked<Repository<Company>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all IPs with filters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockIp]),
      };

      ipRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const filters: FindAllIpsDto = {
        status: IpStatus.AVAILABLE,
      };

      const result = await service.findAll(filters);

      expect(result).toEqual([mockIp]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter by company name', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockIp]),
      };

      ipRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      await service.findAll({ companyName: 'Test Company' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(user.name)'),
        expect.objectContaining({ companyName: '%Test Company%' }),
      );
    });
  });

  describe('bulkCreate', () => {
    const createIpDtos: CreateIpDto[] = [
      { address: '10.0.0.100' },
      { address: '10.0.0.101' },
    ];

    it('should successfully create multiple IPs', async () => {
      roomRepository.findOneBy.mockResolvedValue(mockRoom as any);
      ipRepository.create.mockImplementation((data: any) => ({ ...mockIp, ...data }));
      ipRepository.save.mockResolvedValue([mockIp, mockIp] as any);

      const result = await service.bulkCreate(mockRoom.id, createIpDtos);

      expect(roomRepository.findOneBy).toHaveBeenCalledWith({ id: mockRoom.id });
      expect(ipRepository.create).toHaveBeenCalledTimes(2);
      expect(ipRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when room does not exist', async () => {
      roomRepository.findOneBy.mockResolvedValue(null);

      await expect(service.bulkCreate('invalid-id', createIpDtos)).rejects.toThrow(
        new NotFoundException('Sala com ID "invalid-id" nao encontrada'),
      );
    });
  });

  describe('assign', () => {
    const assignIpDto: AssignIpDto = {
      macAddress: 'AA:BB:CC:DD:EE:FF',
      companyId: mockCompany.id,
    };

    it('should successfully assign IP to company', async () => {
      const ipWithRoom = { ...mockIp, room: mockRoom };
      ipRepository.findOne.mockResolvedValue(ipWithRoom as any);
      companyRepository.findOne.mockResolvedValue(mockCompany as any);
      ipRepository.save.mockResolvedValue({ ...ipWithRoom, status: IpStatus.IN_USE, macAddress: assignIpDto.macAddress } as any);

      const result = await service.assign(mockIp.id, assignIpDto);

      expect(result.status).toBe(IpStatus.IN_USE);
      expect(result.macAddress).toBe(assignIpDto.macAddress);
    });

    it('should throw NotFoundException when IP does not exist', async () => {
      ipRepository.findOne.mockResolvedValue(null);

      await expect(service.assign('invalid-id', assignIpDto)).rejects.toThrow(
        new NotFoundException('IP com ID "invalid-id" nao encontrado'),
      );
    });

    it('should throw ConflictException when IP is already in use', async () => {
      const ipInUse = { ...mockIp, status: IpStatus.IN_USE };
      ipRepository.findOne.mockResolvedValue(ipInUse as any);

      await expect(service.assign(mockIp.id, assignIpDto)).rejects.toThrow(
        new ConflictException(`Endereco IP ${mockIp.address} ja esta em uso`),
      );
    });

    it('should throw NotFoundException when company does not exist', async () => {
      ipRepository.findOne.mockResolvedValue({ ...mockIp, room: mockRoom } as any);
      companyRepository.findOne.mockResolvedValue(null);

      await expect(service.assign(mockIp.id, assignIpDto)).rejects.toThrow(
        new NotFoundException(`Empresa com ID "${assignIpDto.companyId}" nao encontrada`),
      );
    });

    it('should throw BadRequestException when rooms do not match', async () => {
      const differentRoom = { id: 'different-room', number: 999 };
      ipRepository.findOne.mockResolvedValue({ ...mockIp, room: mockRoom } as any);
      companyRepository.findOne.mockResolvedValue({ ...mockCompany, room: differentRoom } as any);

      await expect(service.assign(mockIp.id, assignIpDto)).rejects.toThrow(
        new BadRequestException('Endereco IP nao pertence a sala da empresa'),
      );
    });
  });

  describe('unassign', () => {
    it('should successfully unassign IP', async () => {
      const ipInUse = { ...mockIp, status: IpStatus.IN_USE, macAddress: 'AA:BB:CC:DD:EE:FF' };
      ipRepository.findOneBy.mockResolvedValue(ipInUse as any);
      ipRepository.save.mockResolvedValue({ ...ipInUse, status: IpStatus.AVAILABLE, macAddress: undefined } as any);

      const result = await service.unassign(mockIp.id);

      expect(result.status).toBe(IpStatus.AVAILABLE);
      expect(result.macAddress).toBeUndefined();
    });

    it('should throw NotFoundException when IP does not exist', async () => {
      ipRepository.findOneBy.mockResolvedValue(null);

      await expect(service.unassign('invalid-id')).rejects.toThrow(
        new NotFoundException('IP com ID "invalid-id" nao encontrado'),
      );
    });

    it('should throw ConflictException when IP is already available', async () => {
      ipRepository.findOneBy.mockResolvedValue(mockIp as any);

      await expect(service.unassign(mockIp.id)).rejects.toThrow(
        new ConflictException(`Endereco IP ${mockIp.address} ja esta disponivel`),
      );
    });
  });
});
