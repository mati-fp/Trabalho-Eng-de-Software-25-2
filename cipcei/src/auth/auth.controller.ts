import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
import { BadRequestErrorDto, UnauthorizedErrorDto, ForbiddenErrorDto, TooManyRequestsErrorDto } from '../common/dto/error-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * UC18 e UC19: Endpoint de login
   * Autentica um usuário com email e senha, retornando tokens JWT
   * Rate limited: 5 tentativas por minuto para protecao contra brute-force
   */
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ login: { ttl: 60000, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login de usuário',
    description: 'Autentica um usuário (Admin ou Empresa) com email e senha. Retorna access_token e refresh_token. Rate limited: 5 tentativas por minuto.'
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
    type: BadRequestErrorDto
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
    type: UnauthorizedErrorDto
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas de login. Tente novamente em 1 minuto.',
    type: TooManyRequestsErrorDto
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Renovar access token usando refresh token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar access token',
    description: 'Renova o access token usando um refresh token valido'
  })
  @ApiResponse({ status: 200, description: 'Token renovado com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada invalidos',
    type: BadRequestErrorDto
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token invalido ou expirado',
    type: UnauthorizedErrorDto
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  /**
   * Rota de teste para verificar autenticação e autorização
   */
  @ApiBearerAuth('JWT-auth')
  @Roles([UserRole.ADMIN])
  @Get()
  @ApiOperation({
    summary: 'Teste de autenticação (Admin apenas)',
    description: 'Rota protegida que requer autenticação JWT e role de ADMIN'
  })
  @ApiResponse({ status: 200, description: 'Acesso permitido' })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
    type: UnauthorizedErrorDto
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão (não é Admin)',
    type: ForbiddenErrorDto
  })
  async testGuard(): Promise<string> {
    return 'TESTEI O GUARD - SOMENTE ADMIN';
  }
}