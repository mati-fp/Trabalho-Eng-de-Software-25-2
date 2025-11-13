import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { MensageriaService } from './mensageria.service';
import { SendIpLiberadoDto } from './dto/send-ip-liberado.dto';
import { SendIpCanceladoDto } from './dto/send-ip-cancelado.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('mensageria')
@Public()
export class MensageriaController {
  constructor(private readonly mensageriaService: MensageriaService) {}

  @Post('ip-liberado')
  @HttpCode(HttpStatus.ACCEPTED)
  async ipLiberado(@Body() dto: SendIpLiberadoDto) {
    await this.mensageriaService.sendIpLiberado(dto.companyId, dto.ipId);
    return { ok: true };
  }

  @Post('ip-cancelado')
  @HttpCode(HttpStatus.ACCEPTED)
  async ipCancelado(@Body() dto: SendIpCanceladoDto) {
    await this.mensageriaService.sendIpCancelado(dto.companyId, dto.ipId);
    return { ok: true };
  }

  @Get('inbox')
  async inbox(@Query('limit') limit = '10') {
    return this.mensageriaService.fetchIncomingEmails(Number(limit));
  }
}