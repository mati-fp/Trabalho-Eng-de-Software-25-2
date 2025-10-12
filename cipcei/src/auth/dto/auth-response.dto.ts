import { UserRole } from "src/users/entities/user.entity";

export class AuthResponseDto {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    companyId?: string;
    companyName?: string;
  };
}