import { IsUUID } from 'class-validator';

export class SendIpLiberadoDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  ipId: string;
}
