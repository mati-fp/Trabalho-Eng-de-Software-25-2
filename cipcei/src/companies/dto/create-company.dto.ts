import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsUUID() 
    roomId: string; 
}