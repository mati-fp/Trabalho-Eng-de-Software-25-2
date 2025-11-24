import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IpHistoryService } from './ip-history.service';
import { FindIpHistoryDto } from './dto/find-ip-history.dto';
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
  async findAll(@Query() filters: FindIpHistoryDto) {
    return this.ipHistoryService.findAll(filters);
  }

  @Get('company/:companyId')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Ver histórico completo de IPs de uma empresa (Admin)' })
  async getCompanyHistory(@Param('companyId') companyId: string) {
    return this.ipHistoryService.findByCompany(companyId);
  }

  @Get('ip/:ipId')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Ver histórico de um IP específico (Admin)' })
  async getIpHistory(@Param('ipId') ipId: string) {
    return this.ipHistoryService.findByIp(ipId);
  }

  @Get('ip-address/:address')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Ver histórico detalhado de um endereço IP (Admin)' })
  async getIpDetailedHistory(@Param('address') address: string) {
    return this.ipHistoryService.getIpDetailedHistory(address);
  }
}