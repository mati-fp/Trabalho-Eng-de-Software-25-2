import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Roles([UserRole.ADMIN])
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Criar novo usuario (somente Admin)
   * Empresas devem ser criadas via POST /companies
   */
  @Post()
  @ApiOperation({
    summary: 'Criar usuario (Admin)',
    description: 'Cria um novo usuario. Somente administradores podem criar usuarios diretamente. Para criar empresas, use POST /companies.'
  })
  @ApiResponse({ status: 201, description: 'Usuario criado com sucesso', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Dados invalidos' })
  @ApiResponse({ status: 401, description: 'Nao autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - somente Admin' })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  /**
   * Listar todos os usuarios (somente Admin)
   */
  @Get()
  @ApiOperation({
    summary: 'Listar usuarios (Admin)',
    description: 'Lista todos os usuarios cadastrados. Requer autenticacao JWT e role Admin.'
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios retornada', type: [UserResponseDto] })
  @ApiResponse({ status: 401, description: 'Nao autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - somente Admin' })
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }
}
