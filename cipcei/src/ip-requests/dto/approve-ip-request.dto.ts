import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveIpRequestDto {
  @ApiProperty({ description: 'ID do IP a ser atribuído à solicitação', required: false })
  @IsOptional()
  @IsString()
  ipId?: string;

  @ApiProperty({ description: 'Observações sobre a aprovação', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}