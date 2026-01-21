import { ApiProperty } from '@nestjs/swagger';
import { IpRequestType, IpRequestStatus } from '../entities/ip-request.entity';

/**
 * DTO aninhado para usuario da empresa
 */
class IpRequestCompanyUserDto {
  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Empresa Exemplo LTDA',
  })
  name: string;

  @ApiProperty({
    description: 'Email da empresa',
    example: 'contato@empresa.com',
  })
  email: string;
}

/**
 * DTO aninhado para empresa da solicitacao
 */
class IpRequestCompanyDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Dados do usuario da empresa',
    type: IpRequestCompanyUserDto,
  })
  user: IpRequestCompanyUserDto;

  @ApiProperty({
    description: 'Numero da sala da empresa',
    example: 101,
    required: false,
    nullable: true,
  })
  roomNumber?: number;
}

/**
 * DTO aninhado para IP da solicitacao
 */
class IpRequestIpDto {
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
 * DTO de resposta para solicitacoes de IP
 * Usado em GET /ip-requests, GET /ip-requests/:id, POST /ip-requests
 */
export class IpRequestResponseDto {
  @ApiProperty({
    description: 'ID unico da solicitacao',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Tipo da solicitacao',
    enum: IpRequestType,
    example: IpRequestType.NEW,
  })
  requestType: IpRequestType;

  @ApiProperty({
    description: 'Status da solicitacao',
    enum: IpRequestStatus,
    example: IpRequestStatus.PENDING,
  })
  status: IpRequestStatus;

  @ApiProperty({
    description: 'Justificativa da solicitacao',
    example: 'Necessito de IP para nova estacao de trabalho',
  })
  justification: string;

  @ApiProperty({
    description: 'Motivo da rejeicao (quando aplicavel)',
    example: 'Nao ha IPs disponiveis na sala',
    required: false,
    nullable: true,
  })
  rejectionReason?: string;

  @ApiProperty({
    description: 'Data da solicitacao',
    example: '2025-01-15T10:30:00.000Z',
  })
  requestDate: Date;

  @ApiProperty({
    description: 'Data de expiracao do IP (para IPs temporarios)',
    example: '2025-06-15T10:30:00.000Z',
    required: false,
    nullable: true,
  })
  expirationDate?: Date;

  @ApiProperty({
    description: 'Endereco MAC informado na solicitacao',
    example: '00:1B:44:11:3A:B7',
    required: false,
    nullable: true,
  })
  macAddress?: string;

  @ApiProperty({
    description: 'Nome do funcionario da empresa que utilizara o IP',
    example: 'Joao da Silva',
    required: false,
    nullable: true,
  })
  companyUser?: string;

  @ApiProperty({
    description: 'Empresa solicitante',
    type: IpRequestCompanyDto,
  })
  company: IpRequestCompanyDto;

  @ApiProperty({
    description: 'IP associado (para renovacao/cancelamento)',
    type: IpRequestIpDto,
    required: false,
    nullable: true,
  })
  ip?: IpRequestIpDto;
}