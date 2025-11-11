import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateIpDto } from './create-ip.dto';

export class BulkCreateIpDto {
  @ApiProperty({
    description: 'Array de endereços IP para criar em lote',
    type: [CreateIpDto],
    example: [
      { address: '192.168.1.100' },
      { address: '192.168.1.101' },
      { address: '192.168.1.102' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true }) // Valida cada item do array
  @Type(() => CreateIpDto)
  ips: CreateIpDto[];
}