import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO aninhado para usuario dentro de Company
 */
class CompanyUserDto {
  @ApiProperty({
    description: 'ID do usuario representante',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do usuario/empresa',
    example: 'Empresa Exemplo LTDA',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuario',
    example: 'contato@empresa.com',
  })
  email: string;
}

/**
 * DTO de resposta para empresas
 * Usado em GET /companies, GET /companies/:id, POST /companies
 */
export class CompanyResponseDto {
  @ApiProperty({
    description: 'ID unico da empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Dados do usuario representante da empresa',
    type: CompanyUserDto,
  })
  user: CompanyUserDto;

  @ApiProperty({
    description: 'ID da sala onde a empresa esta alocada',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
    nullable: true,
  })
  roomId?: string;

  @ApiProperty({
    description: 'Numero da sala onde a empresa esta alocada',
    example: 101,
    required: false,
    nullable: true,
  })
  roomNumber?: number;

  @ApiProperty({
    description: 'Data de criacao da empresa',
    example: '2025-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da ultima atualizacao',
    example: '2025-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}