import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface IpRequestEmailData {
  companyName: string;
  companyEmail: string;
  requestType: string;
  justification: string;
  macAddress?: string;
  userName?: string;
  isTemporary?: boolean;
  expirationDate?: Date;
  requestDate: Date;
}

export interface IpApprovedEmailData {
  companyName: string;
  companyEmail: string;
  ipAddress: string;
  macAddress?: string;
  userName?: string;
  requestType: string;
  expirationDate?: Date;
  approvedAt: Date;
}

export interface IpRejectedEmailData {
  companyName: string;
  companyEmail: string;
  requestType: string;
  rejectionReason: string;
  rejectedAt: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly isEmailEnabled: boolean;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.isEmailEnabled = this.configService.get<string>('MAIL_ENABLED') === 'true';
  }

  private formatRequestType(type: string): string {
    const types: Record<string, string> = {
      new: 'Novo IP',
      renewal: 'Renovacao de IP',
      cancellation: 'Cancelamento de IP',
    };
    return types[type] || type;
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Envia email de confirmacao de solicitacao de IP
   */
  async sendIpRequestConfirmation(data: IpRequestEmailData): Promise<void> {
    if (!this.isEmailEnabled) {
      this.logger.log(`[Email desabilitado] Confirmacao de solicitacao para ${data.companyEmail}`);
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: data.companyEmail,
        subject: `Solicitacao de IP Recebida - ${this.formatRequestType(data.requestType)}`,
        template: 'ip-request-confirmation',
        context: {
          companyName: data.companyName,
          requestType: this.formatRequestType(data.requestType),
          justification: data.justification,
          macAddress: data.macAddress || 'Nao informado',
          userName: data.userName || 'Nao informado',
          isTemporary: data.isTemporary ? 'Sim' : 'Nao',
          expirationDate: data.expirationDate ? this.formatDate(data.expirationDate) : 'Permanente',
          requestDate: this.formatDate(data.requestDate),
        },
      });
      this.logger.log(`Email de confirmacao enviado para ${data.companyEmail}`);
    } catch (error) {
      this.logger.error(`Falha ao enviar email de confirmacao: ${error.message}`);
      // Nao lanca excecao para nao bloquear o fluxo principal
    }
  }

  /**
   * Envia email de IP aprovado
   */
  async sendIpApproved(data: IpApprovedEmailData): Promise<void> {
    if (!this.isEmailEnabled) {
      this.logger.log(`[Email desabilitado] Aprovacao de IP para ${data.companyEmail}`);
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: data.companyEmail,
        subject: `IP Aprovado - ${data.ipAddress}`,
        template: 'ip-approved',
        context: {
          companyName: data.companyName,
          ipAddress: data.ipAddress,
          macAddress: data.macAddress || 'Nao informado',
          userName: data.userName || 'Nao informado',
          requestType: this.formatRequestType(data.requestType),
          expirationDate: data.expirationDate ? this.formatDate(data.expirationDate) : 'Permanente',
          approvedAt: this.formatDate(data.approvedAt),
        },
      });
      this.logger.log(`Email de aprovacao enviado para ${data.companyEmail}`);
    } catch (error) {
      this.logger.error(`Falha ao enviar email de aprovacao: ${error.message}`);
    }
  }

  /**
   * Envia email de IP rejeitado
   */
  async sendIpRejected(data: IpRejectedEmailData): Promise<void> {
    if (!this.isEmailEnabled) {
      this.logger.log(`[Email desabilitado] Rejeicao de IP para ${data.companyEmail}`);
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: data.companyEmail,
        subject: `Solicitacao de IP Negada - ${this.formatRequestType(data.requestType)}`,
        template: 'ip-rejected',
        context: {
          companyName: data.companyName,
          requestType: this.formatRequestType(data.requestType),
          rejectionReason: data.rejectionReason,
          rejectedAt: this.formatDate(data.rejectedAt),
        },
      });
      this.logger.log(`Email de rejeicao enviado para ${data.companyEmail}`);
    } catch (error) {
      this.logger.error(`Falha ao enviar email de rejeicao: ${error.message}`);
    }
  }
}