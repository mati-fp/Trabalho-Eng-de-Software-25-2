import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';
import { IpRequest } from '../ip-requests/entities/ip-request.entity';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }

    async sendRequestConfirmation(user: User, request: IpRequest) {
        try {
            const info = await this.mailerService.sendMail({
                to: user.email,
                subject: 'Confirmação de Solicitação de IP',
                template: './confirmation',
                context: {
                    name: user.name,
                    requestType: request.requestType,
                    date: request.requestDate.toLocaleDateString(),
                    justification: request.justification,
                },
            });
            // Log Ethereal URL
            const nodemailer = require('nodemailer');
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        } catch (error) {
            console.error('Erro ao enviar email de confirmação:', error);
        }
    }

    async sendRequestApproval(user: User, request: IpRequest) {
        try {
            const info = await this.mailerService.sendMail({
                to: user.email,
                subject: 'Solicitação de IP Aprovada',
                template: './approval',
                context: {
                    name: user.name,
                    ipAddress: request.ip?.address || 'N/A',
                    macAddress: request.macAddress || 'N/A',
                    expirationDate: request.expirationDate
                        ? request.expirationDate.toLocaleDateString()
                        : 'Indefinido',
                },
            });
            // Log Ethereal URL
            const nodemailer = require('nodemailer');
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        } catch (error) {
            console.error('Erro ao enviar email de aprovação:', error);
        }
    }

    async sendRequestRejection(user: User, request: IpRequest, reason: string) {
        try {
            const info = await this.mailerService.sendMail({
                to: user.email,
                subject: 'Solicitação de IP Rejeitada',
                template: './rejection',
                context: {
                    name: user.name,
                    rejectionReason: reason,
                },
            });
            // Log Ethereal URL
            const nodemailer = require('nodemailer');
            console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        } catch (error) {
            console.error('Erro ao enviar email de rejeição:', error);
        }
    }
}
