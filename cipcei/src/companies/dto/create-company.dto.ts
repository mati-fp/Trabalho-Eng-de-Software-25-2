import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, IsUUID, ValidateNested } from "class-validator";
import { CreateUserDto } from "src/users/dto/create-user.dto";

export class CreateCompanyDto {
  @IsNotEmpty()
  @ValidateNested() // Diz ao NestJS para validar o objeto aninhado
  @Type(() => CreateUserDto) // Diz ao class-transformer como criar a instância do DTO aninhado
  user: CreateUserDto;

  @IsUUID()
  @IsNotEmpty()
  roomId: string;
}