import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendIpCanceladoDto {
  @ApiProperty({
    description: 'UUID da empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({
    description: 'UUID do IP',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  ipId: string;
}
