import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectIpRequestDto {
  @ApiProperty({ description: 'Motivo da rejeição' })
  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}