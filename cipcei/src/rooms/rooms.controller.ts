import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { IpsService } from 'src/ips/ips.service';
import { BulkCreateIpDto } from 'src/ips/dto/bulk-create-ip.dto';

@ApiTags('rooms')
@ApiBearerAuth('JWT-auth')
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly ipsService: IpsService
  ) {}

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