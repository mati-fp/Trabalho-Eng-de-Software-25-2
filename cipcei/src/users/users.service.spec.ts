import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'user-uuid-123',
    email: 'test@test.com',
    name: 'Test User',
    password: 'hashedPassword123',
    role: UserRole.COMPANY,
    isActive: true,
    company: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
  };

  const mockAdminUser: User = {
    id: 'admin-uuid-456',
    email: 'admin@cei.ufrgs.br',
    name: 'Admin User',
    password: 'hashedAdminPassword',
    role: UserRole.ADMIN,
    isActive: true,
    company: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
  };

  const mockCompanyUser: User = {
    id: 'company-uuid-789',
    email: 'company@test.com',
    name: 'Company User',
    password: 'hashedPassword456',
    role: UserRole.COMPANY,
    isActive: true,
    company: {
      id: 'company-id-123',
      roomNumber: 101,
    } as any,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User)) as jest.Mocked<Repository<User>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@test.com',
      name: 'New User',
      password: 'Password@123',
      role: UserRole.COMPANY,
    };

    it('should successfully create a new user', async () => {
      // Setup
      const newUser = { ...mockUser, ...createUserDto };
      repository.create.mockReturnValue(newUser);
      repository.save.mockResolvedValue(newUser);

      // Execute
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual(newUser);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(repository.save).toHaveBeenCalledWith(newUser);
    });

    it('should successfully create an admin user', async () => {
      // Setup
      const createAdminDto: CreateUserDto = {
        email: 'admin@cei.ufrgs.br',
        name: 'Admin User',
        password: 'Admin@123',
        role: UserRole.ADMIN,
      };

      const newAdmin = { ...mockAdminUser, ...createAdminDto };
      repository.create.mockReturnValue(newAdmin);
      repository.save.mockResolvedValue(newAdmin);

      // Execute
      const result = await service.create(createAdminDto);

      // Assert
      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.email).toBe(createAdminDto.email);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Setup
      const pgError = {
        code: '23505', // PostgreSQL unique violation
        detail: 'Key (email)=(test@test.com) already exists.',
      };

      const queryError = new QueryFailedError(
        'INSERT INTO "user"...',
        [],
        pgError as any,
      );
      (queryError as any).driverError = pgError;

      repository.create.mockReturnValue(mockUser);
      repository.save.mockRejectedValue(queryError);

      // Execute & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Email já cadastrado no sistema'),
      );
    });

    it('should re-throw non-duplicate errors', async () => {
      // Setup
      const genericError = new Error('Database connection error');
      repository.create.mockReturnValue(mockUser);
      repository.save.mockRejectedValue(genericError);

      // Execute & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Database connection error',
      );
    });

    it('should handle QueryFailedError with different error codes', async () => {
      // Setup
      const pgError = {
        code: '23503', // Foreign key violation
        detail: 'Some other constraint violation',
      };

      const queryError = new QueryFailedError(
        'INSERT INTO "user"...',
        [],
        pgError as any,
      );
      (queryError as any).driverError = pgError;

      repository.create.mockReturnValue(mockUser);
      repository.save.mockRejectedValue(queryError);

      // Execute & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(QueryFailedError);
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      // Setup
      repository.findOne.mockResolvedValue(mockUser);

      // Execute
      const result = await service.findOne(mockUser.id);

      // Assert
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ['company'],
      });
    });

    it('should find a user with company relation', async () => {
      // Setup
      repository.findOne.mockResolvedValue(mockCompanyUser);

      // Execute
      const result = await service.findOne(mockCompanyUser.id);

      // Assert
      expect(result).toEqual(mockCompanyUser);
      expect(result.company).toBeDefined();
      expect(result.company.id).toBe('company-id-123');
    });

    it('should return null when user is not found', async () => {
      // Setup
      repository.findOne.mockResolvedValue(null);

      // Execute
      const result = await service.findOne('non-existent-id');

      // Assert
      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        relations: ['company'],
      });
    });

    it('should include company relations in query', async () => {
      // Setup
      repository.findOne.mockResolvedValue(mockUser);

      // Execute
      await service.findOne('test-id');

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['company'],
        }),
      );
    });
  });

  describe('findOneByEmail', () => {
    it('should find a user by email', async () => {
      // Setup
      repository.findOne.mockResolvedValue(mockUser);

      // Execute
      const result = await service.findOneByEmail(mockUser.email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        relations: ['company'],
      });
    });

    it('should find a company user with company relation', async () => {
      // Setup
      repository.findOne.mockResolvedValue(mockCompanyUser);

      // Execute
      const result = await service.findOneByEmail(mockCompanyUser.email);

      // Assert
      expect(result.company).toBeDefined();
      expect(result.company.roomNumber).toBe(101);
    });

    it('should return null when email is not found', async () => {
      // Setup
      repository.findOne.mockResolvedValue(null);

      // Execute
      const result = await service.findOneByEmail('notfound@test.com');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle case-sensitive email search', async () => {
      // Setup
      repository.findOne.mockResolvedValue(null);

      // Execute
      await service.findOneByEmail('TEST@TEST.COM');

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'TEST@TEST.COM' },
        relations: ['company'],
      });
    });

    it('should include company relations in query', async () => {
      // Setup
      repository.findOne.mockResolvedValue(mockUser);

      // Execute
      await service.findOneByEmail('test@test.com');

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['company'],
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Setup
      const allUsers = [mockUser, mockAdminUser, mockCompanyUser];
      repository.find.mockResolvedValue(allUsers);

      // Execute
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(allUsers);
      expect(result.length).toBe(3);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      // Setup
      repository.find.mockResolvedValue([]);

      // Execute
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should return users with different roles', async () => {
      // Setup
      const users = [mockAdminUser, mockCompanyUser];
      repository.find.mockResolvedValue(users);

      // Execute
      const result = await service.findAll();

      // Assert
      const roles = result.map((u) => u.role);
      expect(roles).toContain(UserRole.ADMIN);
      expect(roles).toContain(UserRole.COMPANY);
    });
  });
});