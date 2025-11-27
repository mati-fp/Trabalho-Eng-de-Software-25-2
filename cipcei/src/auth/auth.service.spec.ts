import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/entities/user.entity';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'user-uuid-123',
    email: 'test@test.com',
    name: 'Test User',
    password: 'hashedPassword123',
    role: UserRole.COMPANY,
    isActive: true,
    company: {
      id: 'company-uuid-456',
      roomNumber: 101,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockAdminUser = {
    id: 'admin-uuid-789',
    email: 'admin@cei.ufrgs.br',
    name: 'Admin User',
    password: 'hashedAdminPassword',
    role: UserRole.ADMIN,
    isActive: true,
    company: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@test.com',
      password: 'Password@123',
    };

    it('should successfully login a company user and return tokens', async () => {
      // Setup
      usersService.findOneByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce('access-token-123');
      jwtService.sign.mockReturnValueOnce('refresh-token-456');
      configService.get.mockImplementation((key: string) => {
        if (key === 'JWT_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        return null;
      });

      // Execute
      const result = await service.login(loginDto);

      // Assert
      expect(result).toEqual({
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-456',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          companyId: mockUser.company.id,
        },
      });

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should successfully login an admin user without companyId', async () => {
      // Setup
      usersService.findOneByEmail.mockResolvedValue(mockAdminUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce('admin-access-token');
      jwtService.sign.mockReturnValueOnce('admin-refresh-token');
      configService.get.mockImplementation((key: string) => {
        if (key === 'JWT_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        return null;
      });

      // Execute
      const result = await service.login({
        email: mockAdminUser.email,
        password: 'Admin@123',
      });

      // Assert
      expect(result.user.companyId).toBeUndefined();
      expect(result.user.role).toBe(UserRole.ADMIN);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      // Setup
      usersService.findOneByEmail.mockResolvedValue(null);

      // Execute & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Email ou senha invalidos'),
      );

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Setup
      usersService.findOneByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Execute & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Email ou senha invalidos'),
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is inactive (same message as invalid credentials)', async () => {
      // Setup
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findOneByEmail.mockResolvedValue(inactiveUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Execute & Assert
      // Mensagem generica para nao revelar que o usuario existe mas esta inativo
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Email ou senha invalidos'),
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should use default config values when env variables are not set', async () => {
      // Setup
      usersService.findOneByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce('token1');
      jwtService.sign.mockReturnValueOnce('token2');
      configService.get.mockReturnValue(undefined); // No env variables set

      // Execute
      await service.login(loginDto);

      // Assert - should still work with fallback values
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ email: mockUser.email }),
        expect.objectContaining({ expiresIn: '15m' }),
      );
    });
  });

  describe('refreshToken', () => {
    const validRefreshToken = 'valid-refresh-token-xyz';

    it('should successfully refresh access token with valid refresh token', async () => {
      // Setup
      const mockPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findOne.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('new-access-token-789');
      configService.get.mockImplementation((key: string) => {
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        if (key === 'JWT_EXPIRES_IN') return '15m';
        return null;
      });

      // Execute
      const result = await service.refreshToken(validRefreshToken);

      // Assert
      expect(result).toEqual({
        access_token: 'new-access-token-789',
      });

      expect(jwtService.verify).toHaveBeenCalledWith(validRefreshToken, {
        secret: 'refresh-secret',
      });
      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          companyId: mockUser.company.id,
        },
        { expiresIn: '15m' },
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      // Setup
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Execute & Assert
      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        new UnauthorizedException('Refresh token inválido ou expirado'),
      );

      expect(usersService.findOne).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      // Setup
      const mockPayload = {
        sub: 'non-existent-user-id',
        email: 'ghost@test.com',
        role: UserRole.COMPANY,
      };

      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findOne.mockResolvedValue(null);
      configService.get.mockImplementation((key: string) => {
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        return null;
      });

      // Execute & Assert
      await expect(service.refreshToken(validRefreshToken)).rejects.toThrow(
        new UnauthorizedException('Refresh token inválido ou expirado'),
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      // Setup
      const mockPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      const inactiveUser = { ...mockUser, isActive: false };
      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findOne.mockResolvedValue(inactiveUser as any);
      configService.get.mockImplementation((key: string) => {
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        return null;
      });

      // Execute & Assert
      await expect(service.refreshToken(validRefreshToken)).rejects.toThrow(
        new UnauthorizedException('Refresh token inválido ou expirado'),
      );
    });

    it('should use fallback config values when not set', async () => {
      // Setup
      const mockPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      jwtService.verify.mockReturnValue(mockPayload);
      usersService.findOne.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('new-token');
      configService.get.mockReturnValue(undefined);

      // Execute
      await service.refreshToken(validRefreshToken);

      // Assert - should use fallback values
      expect(jwtService.verify).toHaveBeenCalledWith(validRefreshToken, {
        secret: 'fallback-refresh-secret',
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        { expiresIn: '15m' },
      );
    });
  });
});