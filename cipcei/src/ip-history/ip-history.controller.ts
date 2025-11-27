import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { IpHistoryService } from './ip-history.service';
import { FindIpHistoryDto } from './dto/find-ip-history.dto';
import { IpHistoryResponseDto } from './dto/ip-history-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('IP History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ip-history')
export class IpHistoryController {
  constructor(private readonly ipHistoryService: IpHistoryService) {}

  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Listar histórico de IPs com filtros (Admin)' })
  @ApiResponse({ status: 200, description: 'Histórico de IPs retornado', type: [IpHistoryResponseDto] })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findAll(@Query() filters: FindIpHistoryDto): Promise<IpHistoryResponseDto[]> {
    return this.ipHistoryService.findAll(filters);
  }

  @Get('company/:companyId')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Ver histórico completo de IPs de uma empresa (Admin)' })
  @ApiResponse({ status: 200, description: 'Histórico da empresa retornado', type: [IpHistoryResponseDto] })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getCompanyHistory(@Param('companyId') companyId: string): Promise<IpHistoryResponseDto[]> {
    return this.ipHistoryService.findByCompany(companyId);
  }

  @Get('ip/:ipId')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Ver histórico de um IP específico (Admin)' })
  @ApiResponse({ status: 200, description: 'Histórico do IP retornado', type: [IpHistoryResponseDto] })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getIpHistory(@Param('ipId') ipId: string): Promise<IpHistoryResponseDto[]> {
    return this.ipHistoryService.findByIp(ipId);
  }

  @Get('ip-address/:address')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Ver histórico detalhado de um endereço IP (Admin)' })
  @ApiResponse({ status: 200, description: 'Histórico detalhado do IP retornado', type: [IpHistoryResponseDto] })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getIpDetailedHistory(@Param('address') address: string): Promise<IpHistoryResponseDto[]> {
    return this.ipHistoryService.getIpDetailedHistory(address);
  }
}