import { IsIP, IsNotEmpty } from 'class-validator';

export class CreateIpDto {
  @IsIP() // Valida se é um endereço de IP (v4 ou v6)
  @IsNotEmpty()
  address: string;
}