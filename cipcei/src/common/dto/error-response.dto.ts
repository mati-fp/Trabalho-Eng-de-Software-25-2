import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Código de status HTTP',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Mensagem de erro',
    example: 'Dados inválidos',
  })
  message: string | string[];

  @ApiProperty({
    description: 'Tipo de erro',
    example: 'Bad Request',
  })
  error?: string;
}

export class BadRequestErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 400 })
  declare statusCode: 400;

  @ApiProperty({
    example: ['Email é obrigatório', 'Senha deve ter no mínimo 6 caracteres'],
    description: 'Lista de erros de validação',
  })
  declare message: string[];

  @ApiProperty({ example: 'Bad Request' })
  declare error: string;
}

export class UnauthorizedErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 401 })
  declare statusCode: 401;

  @ApiProperty({ example: 'Token inválido ou expirado' })
  declare message: string;

  @ApiProperty({ example: 'Unauthorized' })
  declare error: string;
}

export class ForbiddenErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 403 })
  declare statusCode: 403;

  @ApiProperty({ example: 'Acesso negado. Permissões insuficientes.' })
  declare message: string;

  @ApiProperty({ example: 'Forbidden' })
  declare error: string;
}

export class TooManyRequestsErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 429 })
  declare statusCode: 429;

  @ApiProperty({ example: 'Muitas tentativas. Tente novamente em 1 minuto.' })
  declare message: string;

  @ApiProperty({ example: 'Too Many Requests' })
  declare error: string;
}

export class NotFoundErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 404 })
  declare statusCode: 404;

  @ApiProperty({ example: 'Recurso não encontrado' })
  declare message: string;

  @ApiProperty({ example: 'Not Found' })
  declare error: string;
}

export class InternalServerErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 500 })
  declare statusCode: 500;

  @ApiProperty({ example: 'Erro interno do servidor' })
  declare message: string;

  @ApiProperty({ example: 'Internal Server Error' })
  declare error: string;
}
