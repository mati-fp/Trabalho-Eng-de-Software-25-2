import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  companyId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * UC18 e UC19: Login com Conta de Empresa ou Administrador
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Validar credenciais
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo');
    }

    // Gerar tokens JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company?.id,
    };

    const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'fallback-refresh-secret';
    const jwtRefreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const access_token = this.jwtService.sign(payload, {
      expiresIn: jwtExpiresIn as any,
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: jwtRefreshSecret,
      expiresIn: jwtRefreshExpiresIn as any,
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.company?.id
      },
    };
  }

  /**
   * Validar credenciais do usuário
   */
  private async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      return null;
    }

    // Usar bcrypt.compare (assíncrono) conforme documentação
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Renovar access token usando refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'fallback-refresh-secret';
      const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';

      const payload = this.jwtService.verify(refreshToken, {
        secret: jwtRefreshSecret,
      });

      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuário inválido');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        companyId: user.company?.id,
      };

      return {
        access_token: this.jwtService.sign(newPayload, {
          expiresIn: jwtExpiresIn as any,
        }),
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }
}