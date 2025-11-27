import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserRole } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthResponse = {
    access_token: 'access-token-123',
    refresh_token: 'refresh-token-456',
    user: {
      id: 'user-uuid-123',
      email: 'test@test.com',
      name: 'Test User',
      role: UserRole.COMPANY,
      companyId: 'company-uuid-456',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: 'login',
            ttl: 60000,
            limit: 5,
          },
        ]),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@test.com',
      password: 'Password@123',
    };

    it('should successfully login and return auth response', async () => {
      // Setup
      authService.login.mockResolvedValue(mockAuthResponse);

      // Execute
      const result = await controller.login(loginDto);

      // Assert
      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should call authService.login with correct parameters', async () => {
      // Setup
      authService.login.mockResolvedValue(mockAuthResponse);

      // Execute
      await controller.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith({
        email: loginDto.email,
        password: loginDto.password,
      });
    });

    it('should handle login with admin credentials', async () => {
      // Setup
      const adminLoginDto: LoginDto = {
        email: 'admin@cei.ufrgs.br',
        password: 'Admin@123',
      };

      const adminAuthResponse = {
        ...mockAuthResponse,
        user: {
          id: 'admin-uuid-789',
          email: 'admin@cei.ufrgs.br',
          name: 'Admin User',
          role: UserRole.ADMIN,
          companyId: undefined,
        },
      };

      authService.login.mockResolvedValue(adminAuthResponse);

      // Execute
      const result = await controller.login(adminLoginDto);

      // Assert
      expect(result.user.role).toBe(UserRole.ADMIN);
      expect(result.user.companyId).toBeUndefined();
    });

    it('should propagate errors from authService', async () => {
      // Setup
      const error = new Error('Invalid credentials');
      authService.login.mockRejectedValue(error);

      // Execute & Assert
      await expect(controller.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refresh', () => {
    const validRefreshTokenDto: RefreshTokenDto = {
      refresh_token: 'valid-refresh-token-xyz',
    };

    it('should successfully refresh access token', async () => {
      // Setup
      const mockRefreshResponse = {
        access_token: 'new-access-token-789',
      };

      authService.refreshToken.mockResolvedValue(mockRefreshResponse);

      // Execute
      const result = await controller.refresh(validRefreshTokenDto);

      // Assert
      expect(result).toEqual(mockRefreshResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith(validRefreshTokenDto.refresh_token);
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('should call authService.refreshToken with correct token', async () => {
      // Setup
      authService.refreshToken.mockResolvedValue({
        access_token: 'new-token',
      });

      const testTokenDto: RefreshTokenDto = {
        refresh_token: 'test-refresh-token-123',
      };

      // Execute
      await controller.refresh(testTokenDto);

      // Assert
      expect(authService.refreshToken).toHaveBeenCalledWith(testTokenDto.refresh_token);
    });

    it('should propagate errors from authService on invalid token', async () => {
      // Setup
      const error = new Error('Invalid refresh token');
      authService.refreshToken.mockRejectedValue(error);

      const invalidTokenDto: RefreshTokenDto = {
        refresh_token: 'invalid-token',
      };

      // Execute & Assert
      await expect(controller.refresh(invalidTokenDto)).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should handle expired refresh token', async () => {
      // Setup
      const error = new Error('Token expired');
      authService.refreshToken.mockRejectedValue(error);

      // Execute & Assert
      await expect(controller.refresh(validRefreshTokenDto)).rejects.toThrow('Token expired');
    });
  });

  describe('testGuard', () => {
    it('should return test message for authenticated admin', async () => {
      // Execute
      const result = await controller.testGuard();

      // Assert
      expect(result).toBe('TESTEI O GUARD - SOMENTE ADMIN');
    });

    it('should be a simple string response', async () => {
      // Execute
      const result = await controller.testGuard();

      // Assert
      expect(typeof result).toBe('string');
      expect(result).toContain('ADMIN');
    });
  });
});