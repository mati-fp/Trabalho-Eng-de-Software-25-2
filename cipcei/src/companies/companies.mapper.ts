import { Company } from './entities/company.entity';
import { CompanyResponseDto } from './dto/company-response.dto';

/**
 * Converte uma entidade Company para CompanyResponseDto
 */
export function toCompanyResponseDto(company: Company): CompanyResponseDto {
  return {
    id: company.id,
    user: {
      id: company.user?.id,
      name: company.user?.name,
      email: company.user?.email,
    },
    roomId: company.room?.id ?? undefined,
    roomNumber: company.room?.number ?? undefined,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

/**
 * Converte uma lista de entities Company para lista de CompanyResponseDto
 */
export function toCompanyResponseDtoList(companies: Company[]): CompanyResponseDto[] {
  return companies.map(toCompanyResponseDto);
}