import { ApiProperty } from '@nestjs/swagger';
import { IpAction } from '../entities/ip-history.entity';

/**
 * DTO aninhado para IP no historico
 */
class HistoryIpDto {
  @ApiProperty({
    description: 'ID do IP',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Endereco IP',
    example: '192.168.1.100',
  })
  address: string;
}

/**
 * DTO aninhado para usuario da empresa no historico
 */
class HistoryCompanyUserDto {
  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Empresa Exemplo LTDA',
  })
  name: string;
}

/**
 * DTO aninhado para empresa no historico
 */
class HistoryCompanyDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Dados do usuario da empresa',
    type: HistoryCompanyUserDto,
  })
  user: HistoryCompanyUserDto;
}

/**
 * DTO aninhado para usuario que executou a acao
 */
class PerformedByDto {
  @ApiProperty({
    description: 'ID do usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do usuario',
    example: 'Admin CIPCEI',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuario',
    example: 'admin@cipcei.com',
  })
  email: string;
}

/**
 * DTO de resposta para historico de IPs
 * Usado em GET /ip-history, GET /ip-history/company/:id, GET /ip-history/ip/:id
 */
export class IpHistoryResponseDto {
  @ApiProperty({
    description: 'ID unico do registro de historico',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Acao executada',
    enum: IpAction,
    example: IpAction.ASSIGNED,
  })
  action: IpAction;

  @ApiProperty({
    description: 'Data e hora da acao',
    example: '2025-01-15T10:30:00.000Z',
  })
  performedAt: Date;

  @ApiProperty({
    description: 'Endereco MAC associado a acao',
    example: '00:1B:44:11:3A:B7',
    required: false,
    nullable: true,
  })
  macAddress?: string;

  @ApiProperty({
    description: 'Nome do usuario associado ao IP',
    example: 'Joao da Silva',
    required: false,
    nullable: true,
  })
  userName?: string;

  @ApiProperty({
    description: 'Notas adicionais sobre a acao',
    example: 'IP atribuido para nova estacao de trabalho',
    required: false,
    nullable: true,
  })
  notes?: string;

  @ApiProperty({
    description: 'Data de expiracao (para IPs temporarios)',
    example: '2025-06-15T10:30:00.000Z',
    required: false,
    nullable: true,
  })
  expirationDate?: Date;

  @ApiProperty({
    description: 'IP associado ao historico',
    type: HistoryIpDto,
  })
  ip: HistoryIpDto;

  @ApiProperty({
    description: 'Empresa associada ao historico',
    type: HistoryCompanyDto,
    required: false,
    nullable: true,
  })
  company?: HistoryCompanyDto;

  @ApiProperty({
    description: 'Usuario que executou a acao',
    type: PerformedByDto,
  })
  performedBy: PerformedByDto;
}