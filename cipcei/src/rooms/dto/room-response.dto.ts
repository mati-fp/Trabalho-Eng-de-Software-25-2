import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO aninhado para usuario da empresa
 */
class RoomCompanyUserDto {
  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Empresa Exemplo LTDA',
  })
  name: string;
}

/**
 * DTO aninhado para empresa dentro de Room
 */
export class RoomCompanyDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Dados do usuario da empresa',
    type: RoomCompanyUserDto,
  })
  user: RoomCompanyUserDto;

  @ApiProperty({
    description: 'Numero da sala da empresa',
    example: 101,
  })
  roomNumber: number;
}

/**
 * DTO de resposta para salas
 * Usado em GET /rooms, GET /rooms/:id, POST /rooms
 */
export class RoomResponseDto {
  @ApiProperty({
    description: 'ID unico da sala',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Numero identificador da sala',
    example: 101,
  })
  number: number;

  @ApiProperty({
    description: 'Empresas alocadas na sala',
    type: [RoomCompanyDto],
    required: false,
  })
  companies?: RoomCompanyDto[];
}

/**
 * DTO de resposta resumida para salas
 * Usado em GET /rooms/summary
 */
export class RoomSummaryResponseDto {
  @ApiProperty({
    description: 'ID unico da sala',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Numero identificador da sala',
    example: 101,
  })
  number: number;

  @ApiProperty({
    description: 'Indica se a sala esta ocupada por alguma empresa',
    example: true,
  })
  hasCompanies: boolean;

  @ApiProperty({
    description: 'Quantidade de empresas na sala',
    example: 2,
  })
  companiesCount: number;
}