import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IpStatus } from '../entities/ip.entity';
import { Type } from 'class-transformer';

export class FindAllIpsDto {
  @ApiProperty({
    description: 'Filtrar por status do IP',
    enum: IpStatus,
    required: false,
    example: IpStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(IpStatus)
  status?: IpStatus;

  @ApiProperty({
    description: 'Filtrar por nome da empresa',
    required: false,
    example: 'Empresa Exemplo',
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({
    description: 'Filtrar por número da sala',
    required: false,
    example: 101,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number) // Garante que o parâmetro da URL (string) seja convertido para número
  roomNumber?: number;
}