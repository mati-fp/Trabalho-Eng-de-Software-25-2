import { IpHistory } from './entities/ip-history.entity';
import { IpHistoryResponseDto } from './dto/ip-history-response.dto';

/**
 * Converte uma entidade IpHistory para IpHistoryResponseDto
 */
export function toIpHistoryResponseDto(history: IpHistory): IpHistoryResponseDto {
  return {
    id: history.id,
    action: history.action,
    performedAt: history.performedAt,
    macAddress: history.macAddress ?? undefined,
    userName: history.userName ?? undefined,
    notes: history.notes ?? undefined,
    expirationDate: history.expirationDate ?? undefined,
    ip: {
      id: history.ip?.id,
      address: history.ip?.address,
    },
    company: history.company ? {
      id: history.company.id,
      user: {
        name: history.company.user?.name,
      },
    } : undefined,
    performedBy: {
      id: history.performedBy?.id,
      name: history.performedBy?.name,
      email: history.performedBy?.email,
    },
  };
}

/**
 * Converte uma lista de entities IpHistory para lista de IpHistoryResponseDto
 */
export function toIpHistoryResponseDtoList(histories: IpHistory[]): IpHistoryResponseDto[] {
  return histories.map(toIpHistoryResponseDto);
}