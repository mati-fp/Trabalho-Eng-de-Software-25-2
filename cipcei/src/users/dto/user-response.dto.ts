import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

/**
 * DTO de resposta para usuarios
 * Usado em GET /users e POST /users
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'ID unico do usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome completo do usuario',
    example: 'Joao da Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuario',
    example: 'joao@empresa.com',
  })
  email: string;

  @ApiProperty({
    description: 'Papel do usuario no sistema',
    enum: UserRole,
    example: UserRole.COMPANY,
  })
  role: UserRole;

  @ApiProperty({
    description: 'ID da empresa associada (apenas para usuarios do tipo COMPANY)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
    nullable: true,
  })
  companyId?: string;

  @ApiProperty({
    description: 'Data de criacao do usuario',
    example: '2025-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da ultima atualizacao',
    example: '2025-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}