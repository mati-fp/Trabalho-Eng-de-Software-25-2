// DTO simples pra pedir envio de email de IP liberado
// só valida se os dois IDs chegam certinhos como UUID
import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendIpLiberadoDto {
  // id da empresa que vai receber o aviso
  @ApiProperty({
    description: 'UUID da empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  // id do IP recém liberado pra montar assunto do email
  @ApiProperty({
    description: 'UUID do IP',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  ipId: string;
}