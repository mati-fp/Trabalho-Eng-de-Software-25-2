import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('companies')
@ApiBearerAuth('JWT-auth')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  @Roles([UserRole.COMPANY])
  @Get('me')
  @ApiOperation({ summary: 'Ver perfil da própria empresa (Company)' })
  async getMyCompany(@Request() req) {
    return this.companiesService.findOne(req.user.company.id);
  }

  @Roles([UserRole.COMPANY])
  @Get('me/ips/active')
  @ApiOperation({ summary: 'Ver IPs ativos da empresa (Company)' })
  async getMyActiveIps(@Request() req) {
    return this.companiesService.getActiveIps(req.user.company.id);
  }

  @Roles([UserRole.COMPANY])
  @Get('me/ips/renewable')
  @ApiOperation({ summary: 'Ver IPs renováveis da empresa (Company)' })
  async getMyRenewableIps(@Request() req) {
    return this.companiesService.getRenewableIps(req.user.company.id);
  }

  @Roles([UserRole.COMPANY])
  @Get('me/ips')
  @ApiOperation({ summary: 'Ver todos os IPs da empresa (Company)' })
  async getMyIps(@Request() req) {
    return this.companiesService.getAllMyIps(req.user.company.id);
  }

  @Roles([UserRole.ADMIN])
  @Get()
  @ApiOperation({
    summary: 'Listar todas as empresas',
    description: 'Retorna a lista completa de empresas cadastradas no sistema',
  })
  @ApiResponse({ status: 200, description: 'Lista de empresas retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findAll() {
    return this.companiesService.findAll();
  }

  @Roles([UserRole.ADMIN])
  @Post()
  @ApiOperation({
    summary: 'Criar nova empresa',
    description: 'Cria uma nova empresa junto com seu usuário representante e associa a uma sala',
  })
  @ApiResponse({ status: 201, description: 'Empresa criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Roles([UserRole.ADMIN])
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar empresa por ID',
    description: 'Retorna os dados de uma empresa específica pelo seu UUID',
  })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  async findOne(@Param('id') id: string) {
    const company = await this.companiesService.findOne(id);
    if (!company) {
      throw new NotFoundException(`Company with ID "${id}" not found`);
    }
    return company;
  }

  @Roles([UserRole.ADMIN])
  @Get(':id/ips')
  @ApiOperation({ summary: 'Ver IPs de uma empresa (Admin)' })
  @ApiResponse({ status: 200, description: 'IPs da empresa retornados com sucesso' })
  async getCompanyIps(@Param('id') id: string) {
    return this.companiesService.getAllMyIps(id);
  }

  @Roles([UserRole.ADMIN])
  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar empresa',
    description: 'Atualiza os dados de uma empresa existente',
  })
  @ApiResponse({ status: 200, description: 'Empresa atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
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
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  async remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}