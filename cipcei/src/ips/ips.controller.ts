import { Patch, Param, Body, Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AssignIpDto } from './dto/assign-ip.dto';
import { IpsService } from './ips.service';
import { FindAllIpsDto } from './dto/find-all-ips.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('ips')
@ApiBearerAuth('JWT-auth')
@Roles([UserRole.ADMIN])
@Controller('ips')
export class IpsController {
  constructor(private readonly ipsService: IpsService) {}

  
  @Patch(':id/assign')
  @ApiOperation({
    summary: 'Atribuir IP a uma empresa',
    description: 'Atribui um endereço IP disponível a uma empresa específica, associando um endereço MAC',
  })
  @ApiResponse({ status: 200, description: 'IP atribuído com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou IP já está em uso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'IP ou empresa não encontrados' })
  async assign(@Param('id') id: string, @Body() assignIpDto: AssignIpDto) {
    return this.ipsService.assign(id, assignIpDto);
  }


  @Get()
  @ApiOperation({
    summary: 'Listar IPs com filtros',
    description: 'Retorna lista de endereços IP com filtros opcionais por status, empresa ou sala',
  })
  @ApiResponse({ status: 200, description: 'Lista de IPs retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findAll(@Query() findAllIpsDto: FindAllIpsDto) {
    return this.ipsService.findAll(findAllIpsDto);
  }

  
  @Patch(':id/unassign')
  @ApiOperation({
    summary: 'Desatribuir IP de uma empresa',
    description: 'Remove a atribuição de um IP, tornando-o disponível novamente',
  })
  @ApiResponse({ status: 200, description: 'IP desatribuído com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'IP não encontrado' })
  async unassign(@Param('id') id: string) {
    return this.ipsService.unassign(id);
  }

}