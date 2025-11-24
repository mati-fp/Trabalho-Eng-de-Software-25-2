import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsDateString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IpRequestType } from '../entities/ip-request.entity';

export class CreateIpRequestDto {
  @ApiProperty({ description: 'Tipo da requisição', enum: IpRequestType })
  @IsString()
  @IsNotEmpty()
  requestType: IpRequestType;

  @ApiProperty({ description: 'Justificativa para a solicitação' })
  @IsString()
  @IsNotEmpty()
  justification: string;

  @ApiProperty({ description: 'Endereço MAC da máquina', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, {
    message: 'MAC address inválido',
  })
  macAddress?: string;

  @ApiProperty({ description: 'Nome da pessoa que utilizará o IP', required: false })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({ description: 'Se o IP é temporário', default: false })
  @IsOptional()
  @IsBoolean()
  isTemporary?: boolean;

  @ApiProperty({ description: 'Data de expiração (para IPs temporários)', required: false })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiProperty({ description: 'ID do IP (para renovação ou cancelamento)', required: false })
  @IsOptional()
  @IsString()
  ipId?: string;
}