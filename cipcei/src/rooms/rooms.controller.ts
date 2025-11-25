import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { IpsService } from 'src/ips/ips.service';
import { BulkCreateIpDto } from 'src/ips/dto/bulk-create-ip.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('rooms')
@ApiBearerAuth('JWT-auth')
@Roles([UserRole.ADMIN])
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly ipsService: IpsService
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todas as salas',
    description: 'Retorna a lista de todas as salas com suas empresas associadas',
  })
  @ApiResponse({ status: 200, description: 'Lista de salas retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findAll() {
    return this.roomsService.findAll();
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Listar salas resumidas',
    description: 'Retorna lista simplificada de salas com status de ocupacao',
  })
  @ApiResponse({ status: 200, description: 'Lista resumida de salas' })
  @ApiResponse({ status: 401, description: 'Nao autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas admin' })
  async getSummary() {
    return this.roomsService.getSummary();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar sala por ID',
    description: 'Retorna os dados de uma sala específica com empresas e IPs',
  })
  @ApiResponse({ status: 200, description: 'Sala encontrada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Get(':id/companies')
  @ApiOperation({
    summary: 'Listar empresas de uma sala',
    description: 'Retorna todas as empresas associadas a uma sala específica',
  })
  @ApiResponse({ status: 200, description: 'Lista de empresas da sala' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  async getCompanies(@Param('id') id: string) {
    return this.roomsService.getCompanies(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar nova sala',
    description: 'Cria uma nova sala com um número identificador',
  })
  @ApiResponse({ status: 201, description: 'Sala criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou sala já existe' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Post(':roomId/ips')
  @ApiOperation({
    summary: 'Adicionar IPs em lote a uma sala',
    description: 'Cria múltiplos endereços IP associados a uma sala específica',
  })
  @ApiResponse({ status: 201, description: 'IPs adicionados com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  async addIps(
    @Param('roomId') roomId: string,
    @Body() bulkCreateIpDto: BulkCreateIpDto,
  ) {
    return this.ipsService.bulkCreate(roomId, bulkCreateIpDto.ips);
  }
}