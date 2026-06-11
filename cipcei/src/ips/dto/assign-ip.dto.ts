import { IsMACAddress, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignIpDto {
  @ApiProperty({
    description: 'Endereço MAC do dispositivo',
    example: '00:1B:44:11:3A:B7',
  })
  @IsMACAddress()
  @IsNotEmpty()
  macAddress: string;

  @ApiProperty({
    description: 'UUID da empresa que receberá o IP',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @ApiPropertyOptional({
    description: 'Nome do responsável que utilizará o IP',
    example: 'João da Silva',
  })
  @IsString()
  @IsOptional()
  userName?: string;
}