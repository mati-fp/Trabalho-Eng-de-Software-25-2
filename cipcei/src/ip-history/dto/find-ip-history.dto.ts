import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IpAction } from '../entities/ip-history.entity';

export class FindIpHistoryDto {
  @ApiProperty({ description: 'ID da empresa', required: false })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiProperty({ description: 'ID do IP', required: false })
  @IsOptional()
  @IsString()
  ipId?: string;

  @ApiProperty({ description: 'Tipo de ação', enum: IpAction, required: false })
  @IsOptional()
  @IsEnum(IpAction)
  action?: IpAction;

  @ApiProperty({ description: 'Data inicial', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'Data final', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}