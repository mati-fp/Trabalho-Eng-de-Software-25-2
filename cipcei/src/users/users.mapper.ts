import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';

/**
 * Converte uma entidade User para UserResponseDto
 */
export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.company?.id ?? undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Converte uma lista de entities User para lista de UserResponseDto
 */
export function toUserResponseDtoList(users: User[]): UserResponseDto[] {
  return users.map(toUserResponseDto);
}