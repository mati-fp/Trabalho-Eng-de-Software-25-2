import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('companies')
@ApiBearerAuth('JWT-auth')
@Roles([UserRole.ADMIN])
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

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