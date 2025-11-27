import { Ip } from './entities/ip.entity';
import { IpResponseDto } from './dto/ip-response.dto';

/**
 * Converte uma entidade Ip para IpResponseDto
 */
export function toIpResponseDto(ip: Ip): IpResponseDto {
  return {
    id: ip.id,
    address: ip.address,
    status: ip.status,
    macAddress: ip.macAddress ?? undefined,
    room: ip.room ? {
      id: ip.room.id,
      number: ip.room.number,
    } : undefined,
    company: ip.company ? {
      id: ip.company.id,
      user: {
        name: ip.company.user?.name,
      },
    } : undefined,
    // expiresAt sempre presente na resposta (null quando nao definido)
    expiresAt: ip.expiresAt ?? null,
  };
}

/**
 * Converte uma lista de entities Ip para lista de IpResponseDto
 */
export function toIpResponseDtoList(ips: Ip[]): IpResponseDto[] {
  return ips.map(toIpResponseDto);
}