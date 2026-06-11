import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

/**
 * Campos do usuário representante que podem ser atualizados.
 * Herda as validações do CreateUserDto, mas torna todos os campos opcionais.
 */
export class UpdateCompanyUserDto extends PartialType(CreateUserDto) {}

export class UpdateCompanyDto {
  @ApiPropertyOptional({
    description: 'Dados a atualizar do usuário representante da empresa',
    type: UpdateCompanyUserDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCompanyUserDto)
  user?: UpdateCompanyUserDto;

  @ApiPropertyOptional({
    description: 'UUID da nova sala da empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  roomId?: string;
}
