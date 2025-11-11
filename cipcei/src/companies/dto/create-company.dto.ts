import { Type } from "class-transformer";
import { IsNotEmpty, IsUUID, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CreateUserDto } from "src/users/dto/create-user.dto";

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Dados do usuário representante da empresa',
    type: CreateUserDto,
    example: {
      email: 'empresa@example.com',
      name: 'Empresa Exemplo LTDA',
      password: 'senhaSegura123',
      role: 'COMPANY',
    },
  })
  @IsNotEmpty()
  @ValidateNested() // Diz ao NestJS para validar o objeto aninhado
  @Type(() => CreateUserDto) // Diz ao class-transformer como criar a instância do DTO aninhado
  user: CreateUserDto;

  @ApiProperty({
    description: 'UUID da sala onde a empresa está alocada',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  roomId: string;
}