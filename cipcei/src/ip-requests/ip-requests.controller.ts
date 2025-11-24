import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IpRequestsService } from './ip-requests.service';
import { CreateIpRequestDto } from './dto/create-ip-request.dto';
import { ApproveIpRequestDto } from './dto/approve-ip-request.dto';
import { RejectIpRequestDto } from './dto/reject-ip-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('IP Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ip-requests')
export class IpRequestsController {
  constructor(private readonly ipRequestsService: IpRequestsService) {}

  /**
   * UC3: Empresa solicita IP (NEW, RENEWAL, CANCELLATION)
   */
  @Post()
  @Roles([UserRole.COMPANY])
  @ApiOperation({ summary: 'Solicitar IP (Company) - UC3, UC5, UC2' })
  async create(@Body() createIpRequestDto: CreateIpRequestDto, @Request() req) {
    return this.ipRequestsService.create(createIpRequestDto, req.user);
  }

  /**
   * Admin lista todas as solicitações
   */
  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Listar todas as solicitações (Admin)' })
  async findAll() {
    return this.ipRequestsService.findAll();
  }

  /**
   * Empresa lista suas próprias solicitações
   * ROTA ESPECÍFICA - Deve vir antes de /:id
   */
  @Get('my-requests')
  @Roles([UserRole.COMPANY])
  @ApiOperation({ summary: 'Listar minhas solicitações (Company)' })
  async getMyRequests(@Request() req) {
    return this.ipRequestsService.findByCompany(req.user.company.id);
  }

  /**
   * Admin lista solicitações pendentes
   * ROTA ESPECÍFICA - Deve vir antes de /:id
   */
  @Get('pending')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Listar solicitações pendentes (Admin)' })
  async findPending() {
    return this.ipRequestsService.findPending();
  }

  /**
   * Admin lista solicitações de uma empresa específica
   * ROTA ESPECÍFICA - Deve vir antes de /:id
   */
  @Get('company/:companyId')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Listar solicitações de uma empresa (Admin)' })
  async findByCompany(@Param('companyId') companyId: string) {
    return this.ipRequestsService.findByCompany(companyId);
  }

  /**
   * Admin ou Company busca uma solicitação específica
   * ROTA GENÉRICA - Deve vir por último entre os GETs
   */
  @Get(':id')
  @Roles([UserRole.ADMIN, UserRole.COMPANY])
  @ApiOperation({ summary: 'Buscar solicitação por ID' })
  async findOne(@Param('id') id: string) {
    return this.ipRequestsService.findOne(id);
  }

  /**
   * Empresa cancela solicitação pendente
   */
  @Patch(':id/cancel')
  @Roles([UserRole.COMPANY])
  @ApiOperation({ summary: 'Cancelar solicitação pendente (Company)' })
  async cancel(@Param('id') id: string, @Request() req) {
    return this.ipRequestsService.cancel(id, req.user);
  }

  /**
   * Admin aprova solicitação - UC9
   */
  @Patch(':id/approve')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Aprovar solicitação (Admin)' })
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveIpRequestDto,
    @Request() req,
  ) {
    return this.ipRequestsService.approve(id, approveDto, req.user);
  }

  /**
   * Admin rejeita solicitação - UC9
   */
  @Patch(':id/reject')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Rejeitar solicitação (Admin)' })
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectIpRequestDto,
    @Request() req,
  ) {
    return this.ipRequestsService.reject(id, rejectDto, req.user);
  }
}