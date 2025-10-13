import { IsMACAddress, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignIpDto {
  @IsMACAddress()
  @IsNotEmpty()
  macAddress: string;

  @IsUUID()
  @IsNotEmpty()
  companyId: string;
}