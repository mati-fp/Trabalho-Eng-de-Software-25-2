import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { IpStatus } from '../entities/ip.entity';

export class FindAllIpsDto {
  @IsOptional()
  @IsEnum(IpStatus)
  status?: IpStatus;

  @IsOptional()
  @IsUUID()
  companyId?: string;
}