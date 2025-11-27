import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';
import { Public } from '../auth/decorators/public.decorator';
import { EmailService } from './email.service';

class TestEmailDto {
  @IsEmail()
  destinatario: string;

  @IsString()
  @IsOptional()
  tipo?: 'confirmacao' | 'aprovacao' | 'rejeicao';
}

@ApiTags('Email Test')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Rota de teste para envio de emails (DEV ONLY)' })
  @ApiResponse({ status: 200, description: 'Email enviado com sucesso' })
  async testEmail(@Body() dto: TestEmailDto) {
    const tipo = dto.tipo || 'confirmacao';

    // Dados ficticios para teste
    const dadosFicticios = {
      companyName: 'Empresa Teste LTDA',
      companyEmail: dto.destinatario,
      requestDate: new Date(),
      approvedAt: new Date(),
      rejectedAt: new Date(),
    };

    switch (tipo) {
      case 'confirmacao':
        await this.emailService.sendIpRequestConfirmation({
          ...dadosFicticios,
          requestType: 'new',
          justification: 'Precisamos de um IP para o novo servidor de desenvolvimento',
          macAddress: 'AA:BB:CC:DD:EE:FF',
          userName: 'Joao da Silva',
          isTemporary: false,
          expirationDate: undefined,
        });
        return {
          message: 'Email de confirmacao de solicitacao enviado!',
          destinatario: dto.destinatario,
          tipo: 'confirmacao'
        };

      case 'aprovacao':
        await this.emailService.sendIpApproved({
          ...dadosFicticios,
          ipAddress: '192.168.100.42',
          macAddress: 'AA:BB:CC:DD:EE:FF',
          userName: 'Joao da Silva',
          requestType: 'new',
          expirationDate: new Date('2026-12-31'),
        });
        return {
          message: 'Email de aprovacao de IP enviado!',
          destinatario: dto.destinatario,
          tipo: 'aprovacao'
        };

      case 'rejeicao':
        await this.emailService.sendIpRejected({
          ...dadosFicticios,
          requestType: 'new',
          rejectionReason: 'Nao ha IPs disponiveis na sala no momento. Por favor, tente novamente em 30 dias.',
        });
        return {
          message: 'Email de rejeicao enviado!',
          destinatario: dto.destinatario,
          tipo: 'rejeicao'
        };
    }
  }
}