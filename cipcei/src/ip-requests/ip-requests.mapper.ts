import { IpRequest } from './entities/ip-request.entity';
import { IpRequestResponseDto } from './dto/ip-request-response.dto';

/**
 * Converte uma entidade IpRequest para IpRequestResponseDto
 */
export function toIpRequestResponseDto(request: IpRequest): IpRequestResponseDto {
  return {
    id: request.id,
    requestType: request.requestType,
    status: request.status,
    justification: request.justification,
    rejectionReason: request.rejectionReason ?? undefined,
    requestDate: request.requestDate,
    expirationDate: request.expirationDate ?? undefined,
    macAddress: request.macAddress ?? undefined,
    companyUser: request.userName ?? undefined,
    company: {
      id: request.company?.id,
      user: {
        name: request.company?.user?.name,
        email: request.company?.user?.email,
      },
      roomNumber: request.company?.room?.number ?? undefined,
    },
    ip: request.ip ? {
      id: request.ip.id,
      address: request.ip.address,
    } : undefined,
  };
}

/**
 * Converte uma lista de entities IpRequest para lista de IpRequestResponseDto
 */
export function toIpRequestResponseDtoList(requests: IpRequest[]): IpRequestResponseDto[] {
  return requests.map(toIpRequestResponseDto);
}