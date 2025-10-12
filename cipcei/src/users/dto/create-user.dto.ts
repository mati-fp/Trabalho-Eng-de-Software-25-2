import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  // Adicionaremos companyId e role depois, quando o endpoint for usado por um admin
  @IsString()
  role?: UserRole; // Padrão será COMPANY se não fornecido
}