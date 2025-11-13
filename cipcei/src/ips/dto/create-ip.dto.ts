import { IsIP, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIpDto {
  @ApiProperty({
    description: 'Endereço IP (IPv4 ou IPv6)',
    example: '192.168.1.100',
  })
  @IsIP() // Valida se é um endereço de IP (v4 ou v6)
  @IsNotEmpty()
  address: string;
}