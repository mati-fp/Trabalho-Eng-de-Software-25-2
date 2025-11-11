import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from "src/users/entities/user.entity";

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT (válido por 15 minutos)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Token de atualização (válido por 7 dias)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refresh_token?: string;

  @ApiProperty({
    description: 'Informações do usuário autenticado',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@cipcei.com',
      name: 'Administrador CIPCEI',
      role: 'ADMIN',
      companyId: null,
    },
  })
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    companyId?: string;
  };
}