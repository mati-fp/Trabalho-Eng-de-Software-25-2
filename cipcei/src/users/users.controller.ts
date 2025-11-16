import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('users')
@Roles([UserRole.ADMIN])
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Criar novo usuário (Admin ou Empresa)
   */
  @Public()
  @Post()
  @ApiOperation({
    summary: 'Criar usuário',
    description: 'Cria um novo usuário (Admin ou Empresa). Rota pública para permitir cadastro inicial.'
  })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Listar todos os usuários (requer autenticação)
   */
  @ApiBearerAuth('JWT-auth')
  @Get()
  @ApiOperation({
    summary: 'Listar usuários',
    description: 'Lista todos os usuários cadastrados. Requer autenticação JWT.'
  })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findAll() {
    return this.usersService.findAll();
  }
}
