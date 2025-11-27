import { ApiProperty } from '@nestjs/swagger';
import { IpStatus } from '../entities/ip.entity';

/**
 * DTO aninhado para sala dentro de IP
 */
class IpRoomDto {
  @ApiProperty({
    description: 'ID da sala',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Numero da sala',
    example: 101,
  })
  number: number;
}

/**
 * DTO aninhado para usuario da empresa dentro de IP
 */
class IpCompanyUserDto {
  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Empresa Exemplo LTDA',
  })
  name: string;
}

/**
 * DTO aninhado para empresa dentro de IP
 */
class IpCompanyDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Dados do usuario da empresa',
    type: IpCompanyUserDto,
  })
  user: IpCompanyUserDto;
}

/**
 * DTO de resposta para IPs
 * Usado em GET /ips, PATCH /ips/:id/assign, PATCH /ips/:id/unassign
 */
export class IpResponseDto {
  @ApiProperty({
    description: 'ID unico do IP',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Endereco IP',
    example: '192.168.1.100',
  })
  address: string;

  @ApiProperty({
    description: 'Status do IP',
    enum: IpStatus,
    example: IpStatus.AVAILABLE,
  })
  status: IpStatus;

  @ApiProperty({
    description: 'Endereco MAC associado ao IP',
    example: '00:1B:44:11:3A:B7',
    required: false,
    nullable: true,
  })
  macAddress?: string;

  @ApiProperty({
    description: 'Sala onde o IP esta alocado',
    type: IpRoomDto,
    required: false,
    nullable: true,
  })
  room?: IpRoomDto;

  @ApiProperty({
    description: 'Empresa que esta usando o IP',
    type: IpCompanyDto,
    required: false,
    nullable: true,
  })
  company?: IpCompanyDto;

  @ApiProperty({
    description: 'Data de expiracao do IP (para IPs temporarios)',
    example: '2025-06-15T10:30:00.000Z',
    required: false,
    nullable: true,
  })
  expiresAt?: Date;
}