// ESTÁ MARCADO COMO PÚBLICO, TALVEZ TENHA QUE TROCAR PARA AUTH
import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MensageriaService } from './mensageria.service';
import { SendIpLiberadoDto } from './dto/send-ip-liberado.dto';
import { SendIpCanceladoDto } from './dto/send-ip-cancelado.dto';
import { Public } from '../auth/decorators/public.decorator';
import { BadRequestErrorDto, NotFoundErrorDto, InternalServerErrorDto } from '../common/dto/error-response.dto';

@ApiTags('mensageria')
@Controller('mensageria')
@Public() // deixa acessível pra testar rápido via Swagger sem token
export class MensageriaController {
  constructor(private readonly mensageriaService: MensageriaService) {}

  @Post('ip-liberado')
  @ApiOperation({
    summary: 'Enviar email: IP liberado',
    description: 'Dispara um email para a empresa avisando que o IP foi liberado e associado.',
  })
  @ApiResponse({ status: 202, description: 'Solicitação aceita e processamento iniciado (envio de email)' })
  @ApiResponse({ status: 400, description: 'Requisição inválida (UUID inválido ou empresa sem e-mail)', type: BadRequestErrorDto })
  @ApiResponse({ status: 404, description: 'Empresa ou IP não encontrados', type: NotFoundErrorDto })
  @ApiResponse({ status: 500, description: 'Erro interno ao enviar email', type: InternalServerErrorDto })
  @HttpCode(HttpStatus.ACCEPTED)
  async ipLiberado(@Body() dto: SendIpLiberadoDto) {
    // dispara email avisando que o IP foi liberado pra empresa
    await this.mensageriaService.sendIpLiberado(dto.companyId, dto.ipId);
    return { ok: true };
  }

  @Post('ip-cancelado')
  @ApiOperation({
    summary: 'Enviar email: IP cancelado',
    description: 'Dispara um email para a empresa confirmando o cancelamento/desalocação do IP.',
  })
  @ApiResponse({ status: 202, description: 'Solicitação aceita e processamento iniciado (envio de email)' })
  @ApiResponse({ status: 400, description: 'Requisição inválida (UUID inválido ou empresa sem e-mail)', type: BadRequestErrorDto })
  @ApiResponse({ status: 404, description: 'Empresa ou IP não encontrados', type: NotFoundErrorDto })
  @ApiResponse({ status: 500, description: 'Erro interno ao enviar email', type: InternalServerErrorDto })
  @HttpCode(HttpStatus.ACCEPTED)
  async ipCancelado(@Body() dto: SendIpCanceladoDto) {
    // avisa que o IP foi cancelado / removido da empresa
    await this.mensageriaService.sendIpCancelado(dto.companyId, dto.ipId);
    return { ok: true };
  }

  @Get('inbox')
  @ApiOperation({
    summary: 'Listar emails recebidos (headers)',
    description: 'Retorna cabeçalhos (from, subject, date) das mensagens não lidas via IMAP, limitado por "limit".',
  })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  @ApiResponse({ status: 500, description: 'Falha ao conectar/ler caixa IMAP', type: InternalServerErrorDto })
  async inbox(@Query('limit') limit = '10') {
    // pega emails que chegaram (limit básico pra não exagerar)
    return this.mensageriaService.fetchIncomingEmails(Number(limit));
  }
}