import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateIpDto } from './create-ip.dto';

export class BulkCreateIpDto {
  @IsArray()
  @ValidateNested({ each: true }) // Valida cada item do array
  @Type(() => CreateIpDto)
  ips: CreateIpDto[];
}