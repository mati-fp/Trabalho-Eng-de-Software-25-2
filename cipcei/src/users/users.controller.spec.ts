import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
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

  const mockAdminUser = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findOneByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@test.com',
      name: 'New User',
      password: 'Password@123',
      role: UserRole.COMPANY,
    };

    it('should create a new company user', async () => {
      // Setup
      const newUser = { ...mockUser, ...createUserDto };
      usersService.create.mockResolvedValue(newUser as any);

      // Execute
      const result = await controller.create(createUserDto);

      // Assert
      expect(result).toEqual(newUser);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(usersService.create).toHaveBeenCalledTimes(1);
    });

    it('should create a new admin user', async () => {
      // Setup
      const createAdminDto: CreateUserDto = {
        email: 'admin@cei.ufrgs.br',
        name: 'Admin User',
        password: 'Admin@123',
        role: UserRole.ADMIN,
      };

      const newAdmin = { ...mockAdminUser, ...createAdminDto };
      usersService.create.mockResolvedValue(newAdmin as any);

      // Execute
      const result = await controller.create(createAdminDto);

      // Assert
      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.email).toBe(createAdminDto.email);
    });

    it('should call usersService.create with correct parameters', async () => {
      // Setup
      usersService.create.mockResolvedValue(mockUser as any);

      // Execute
      await controller.create(createUserDto);

      // Assert
      expect(usersService.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        name: createUserDto.name,
        password: createUserDto.password,
        role: createUserDto.role,
      });
    });

    it('should propagate errors from usersService', async () => {
      // Setup
      const error = new Error('Database error');
      usersService.create.mockRejectedValue(error);

      // Execute & Assert
      await expect(controller.create(createUserDto)).rejects.toThrow('Database error');
    });

    it('should handle ConflictException for duplicate email', async () => {
      // Setup
      const conflictError = new Error('Email já cadastrado no sistema');
      conflictError.name = 'ConflictException';
      usersService.create.mockRejectedValue(conflictError);

      // Execute & Assert
      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Email já cadastrado no sistema',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Setup
      const allUsers = [mockUser, mockAdminUser];
      usersService.findAll.mockResolvedValue(allUsers as any);

      // Execute
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(allUsers);
      expect(result.length).toBe(2);
      expect(usersService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      // Setup
      usersService.findAll.mockResolvedValue([]);

      // Execute
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should call usersService.findAll without parameters', async () => {
      // Setup
      usersService.findAll.mockResolvedValue([mockUser] as any);

      // Execute
      await controller.findAll();

      // Assert
      expect(usersService.findAll).toHaveBeenCalledWith();
    });

    it('should return users with different roles', async () => {
      // Setup
      const users = [
        { ...mockUser, role: UserRole.COMPANY },
        { ...mockAdminUser, role: UserRole.ADMIN },
      ];
      usersService.findAll.mockResolvedValue(users as any);

      // Execute
      const result = await controller.findAll();

      // Assert
      const roles = result.map((u) => u.role);
      expect(roles).toContain(UserRole.ADMIN);
      expect(roles).toContain(UserRole.COMPANY);
    });

    it('should propagate errors from usersService', async () => {
      // Setup
      const error = new Error('Database connection error');
      usersService.findAll.mockRejectedValue(error);

      // Execute & Assert
      await expect(controller.findAll()).rejects.toThrow('Database connection error');
    });
  });
});