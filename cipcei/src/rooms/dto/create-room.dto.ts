import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Número identificador da sala',
    example: 101,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  number: number;
}