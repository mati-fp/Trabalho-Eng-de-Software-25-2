import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({
    description: 'Pagina atual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Itens por pagina',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de itens',
    example: 100,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Total de paginas',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Tem pagina anterior',
    example: false,
  })
  hasPreviousPage: boolean;

  @ApiProperty({
    description: 'Tem proxima pagina',
    example: true,
  })
  hasNextPage: boolean;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginationMeta;

  constructor(data: T[], totalItems: number, page: number, limit: number) {
    this.data = data;
    const totalPages = Math.ceil(totalItems / limit);
    this.meta = {
      page,
      limit,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }
}

/**
 * Factory function para criar response paginado
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number,
): PaginatedResponseDto<T> {
  return new PaginatedResponseDto(data, totalItems, page, limit);
}