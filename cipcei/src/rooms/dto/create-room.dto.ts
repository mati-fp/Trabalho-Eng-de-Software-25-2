import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateRoomDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  number: number;
}