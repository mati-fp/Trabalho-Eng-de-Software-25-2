import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { IpResponseDto } from 'src/ips/dto/ip-response.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('companies')
@ApiBearerAuth('JWT-auth')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  @Roles([UserRole.COMPANY])
  @Get('me')
  @ApiOperation({ summary: 'Ver perfil da propria empresa (Company)' })
  @ApiResponse({ status: 200, description: 'Perfil da empresa retornado', type: CompanyResponseDto })
  @ApiResponse({ status: 401, description: 'Nao autenticado' })
  async getMyCompany(@Request() req): Promise<CompanyResponseDto | null> {
    return this.companiesService.findOne(req.user.company.id);
  }

  @Roles([UserRole.COMPANY])
  @Get('me/ips/active')
  @ApiOperation({ summary: 'Ver IPs ativos da empresa (Company)' })
  @ApiResponse({ status: 200, description: 'IPs ativos retornados', type: [IpResponseDto] })
  @ApiResponse({ status: 401, description: 'Nao autenticado' })
  async getMyActiveIps(@Request() req): Promise<IpResponseDto[]> {
    return this.companiesService.getActiveIps(req.user.company.id);
  }

  @Roles([UserRole.COMPANY])
  @Get('me/ips/renewable')
  @ApiOperation({ summary: 'Ver IPs renovaveis da empresa (Company)' })
  @ApiResponse({ status: 200, description: 'IPs renovaveis retornados', type: [IpResponseDto] })
  @ApiResponse({ status: 401, description: 'Nao autenticado' })
  async getMyRenewableIps(@Request() req): Promise<IpResponseDto[]> {
    return this.companiesService.getRenewableIps(req.user.company.id);
  }

  @Roles([UserRole.COMPANY])
  @Get('me/ips')
  @ApiOperation({ summary: 'Ver todos os IPs da empresa (Company)' })
  @ApiResponse({ status: 200, description: 'IPs retornados', type: [IpResponseDto] })
  @ApiResponse({ status: 401, description: 'Nao autenticado' })
  async getMyIps(@Request() req): Promise<IpResponseDto[]> {
    return this.companiesService.getAllMyIps(req.user.company.id);
  }

  @Roles([UserRole.ADMIN])
  @Get()
  @ApiOperation({
    summary: 'Listar todas as empresas',
    description: 'Retorna a lista completa de empresas cadastradas no sistema',
  })
  @ApiResponse({ status: 200, description: 'Lista de empresas retornada com sucesso', type: [CompanyResponseDto] })
  @ApiResponse({ status: 401, description: 'Nao autenticado' })
  async findAll(): Promise<CompanyResponseDto[]> {
    return this.companiesService.findAll();
  }

  @Roles([UserRole.ADMIN])
  @Post()
  @ApiOperation({
    summary: 'Criar nova empresa',
    description: 'Cria uma nova empresa junto com seu usuario representante e associa a uma sala',
  })
  @ApiResponse({ status: 201, description: 'Empresa criada com sucesso', type: CompanyResponseDto })
  @ApiResponse({ status: 400, description: 'Dados invalidos' })
  @ApiResponse({ status: 401, description: 'Nao autenticado' })
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    return this.companiesService.create(createCompanyDto);
  }

  @Roles([UserRole.ADMIN])
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar empresa por ID',
    description: 'Retorna os dados de uma empresa especifica pelo seu UUID',
  })
  @ApiResponse({ status: 200, description: 'Empresa encontrada', type: CompanyResponseDto })
  @ApiResponse({ status: 401, description: 'Nao autenticado' })
  @ApiResponse({ status: 404, description: 'Empresa nao encontrada' })
  async findOne(@Param('id') id: string): Promise<CompanyResponseDto> {
    const company = await this.companiesService.findOne(id);
    if (!company) {
      throw new NotFoundException(`Empresa com ID "${id}" nao encontrada`);
    }
    return company;
  }

  @Roles([UserRole.ADMIN])
  @Get(':id/ips')
  @ApiOperation({ summary: 'Ver IPs de uma empresa (Admin)' })
  @ApiResponse({ status: 200, description: 'IPs da empresa retornados com sucesso', type: [IpResponseDto] })
  @ApiResponse({ status: 401, description: 'Nao autenticado' })
  async getCompanyIps(@Param('id') id: string): Promise<IpResponseDto[]> {
    return this.companiesService.getAllMyIps(id);
  }

  @Roles([UserRole.ADMIN])
  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar empresa',
    description: 'Atualiza os dados de uma empresa existente',
  })
  @ApiResponse({ status: 200, description: 'Empresa atualizada com sucesso', type: CompanyResponseDto })
  @ApiResponse({ status: 400, description: 'Dados invalidos' })
  @ApiResponse({ status: 401, description: 'Nao autenticado' })
  @ApiResponse({ status: 404, description: 'Empresa nao encontrada' })
  async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto): Promise<CompanyResponseDto> {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Roles([UserRole.ADMIN])
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Remover empresa',
    description: 'Remove uma empresa do sistema (soft delete)',
  })
  @ApiResponse({ status: 204, description: 'Empresa removida com sucesso' })
  @ApiResponse({ status: 401, description: 'Nao autenticado' })
  @ApiResponse({ status: 404, description: 'Empresa nao encontrada' })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.companiesService.remove(id, req.user);
  }
}