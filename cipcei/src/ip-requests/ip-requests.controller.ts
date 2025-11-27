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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { IpRequestsService } from './ip-requests.service';
import { CreateIpRequestDto } from './dto/create-ip-request.dto';
import { ApproveIpRequestDto } from './dto/approve-ip-request.dto';
import { RejectIpRequestDto } from './dto/reject-ip-request.dto';
import { IpRequestResponseDto } from './dto/ip-request-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('IP Requests')
@ApiBearerAuth()
@Controller('ip-requests')
export class IpRequestsController {
  constructor(private readonly ipRequestsService: IpRequestsService) {}

  /**
   * UC3: Empresa solicita IP (NEW, RENEWAL, CANCELLATION)
   */
  @Post()
  @Roles([UserRole.COMPANY])
  @ApiOperation({ summary: 'Solicitar IP (Company) - UC3, UC5, UC2' })
  @ApiResponse({ status: 201, description: 'Solicitação criada com sucesso', type: IpRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async create(@Body() createIpRequestDto: CreateIpRequestDto, @Request() req): Promise<IpRequestResponseDto> {
    return this.ipRequestsService.create(createIpRequestDto, req.user);
  }

  /**
   * Admin lista todas as solicitações
   */
  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Listar todas as solicitações (Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de solicitações retornada', type: [IpRequestResponseDto] })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findAll(): Promise<IpRequestResponseDto[]> {
    return this.ipRequestsService.findAll();
  }

  /**
   * Empresa lista suas próprias solicitações
   * ROTA ESPECÍFICA - Deve vir antes de /:id
   */
  @Get('my-requests')
  @Roles([UserRole.COMPANY])
  @ApiOperation({ summary: 'Listar minhas solicitações (Company)' })
  @ApiResponse({ status: 200, description: 'Minhas solicitações retornadas', type: [IpRequestResponseDto] })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getMyRequests(@Request() req): Promise<IpRequestResponseDto[]> {
    return this.ipRequestsService.findByCompany(req.user.company.id);
  }

  /**
   * Admin lista solicitações pendentes
   * ROTA ESPECÍFICA - Deve vir antes de /:id
   */
  @Get('pending')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Listar solicitações pendentes (Admin)' })
  @ApiResponse({ status: 200, description: 'Solicitações pendentes retornadas', type: [IpRequestResponseDto] })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findPending(): Promise<IpRequestResponseDto[]> {
    return this.ipRequestsService.findPending();
  }

  /**
   * Admin lista solicitações de uma empresa específica
   * ROTA ESPECÍFICA - Deve vir antes de /:id
   */
  @Get('company/:companyId')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Listar solicitações de uma empresa (Admin)' })
  @ApiResponse({ status: 200, description: 'Solicitações da empresa retornadas', type: [IpRequestResponseDto] })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findByCompany(@Param('companyId') companyId: string): Promise<IpRequestResponseDto[]> {
    return this.ipRequestsService.findByCompany(companyId);
  }

  /**
   * Admin ou Company busca uma solicitação específica
   * ROTA GENÉRICA - Deve vir por último entre os GETs
   */
  @Get(':id')
  @Roles([UserRole.ADMIN, UserRole.COMPANY])
  @ApiOperation({ summary: 'Buscar solicitação por ID' })
  @ApiResponse({ status: 200, description: 'Solicitação encontrada', type: IpRequestResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada' })
  async findOne(@Param('id') id: string): Promise<IpRequestResponseDto> {
    return this.ipRequestsService.findOne(id);
  }

  /**
   * Empresa cancela solicitação pendente
   */
  @Patch(':id/cancel')
  @Roles([UserRole.COMPANY])
  @ApiOperation({ summary: 'Cancelar solicitação pendente (Company)' })
  @ApiResponse({ status: 200, description: 'Solicitação cancelada', type: IpRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Solicitação já processada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async cancel(@Param('id') id: string, @Request() req): Promise<IpRequestResponseDto> {
    return this.ipRequestsService.cancel(id, req.user);
  }

  /**
   * Admin aprova solicitação - UC9
   */
  @Patch(':id/approve')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Aprovar solicitação (Admin)' })
  @ApiResponse({ status: 200, description: 'Solicitação aprovada', type: IpRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Solicitação já processada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveIpRequestDto,
    @Request() req,
  ): Promise<IpRequestResponseDto> {
    return this.ipRequestsService.approve(id, approveDto, req.user);
  }

  /**
   * Admin rejeita solicitação - UC9
   */
  @Patch(':id/reject')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Rejeitar solicitação (Admin)' })
  @ApiResponse({ status: 200, description: 'Solicitação rejeitada', type: IpRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Solicitação já processada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectIpRequestDto,
    @Request() req,
  ): Promise<IpRequestResponseDto> {
    return this.ipRequestsService.reject(id, rejectDto, req.user);
  }
}