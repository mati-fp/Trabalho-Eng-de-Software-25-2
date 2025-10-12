import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { IpStatus } from '../entities/ip.entity';
import { Type } from 'class-transformer';

export class FindAllIpsDto {
  @IsOptional()
  @IsEnum(IpStatus)
  status?: IpStatus;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number) // Garante que o parâmetro da URL (string) seja convertido para número
  roomNumber?: number;
}