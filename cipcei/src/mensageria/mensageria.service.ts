import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../companies/entities/company.entity';
import { Ip } from '../ips/entities/ip.entity';
import { Room } from '../rooms/entities/room.entity';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as Imap from 'imap-simple';

@Injectable()
export class MensageriaService {
  private readonly logger = new Logger(MensageriaService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Company) private readonly companyRepo: Repository<Company>,
    @InjectRepository(Ip) private readonly ipRepo: Repository<Ip>,
    @InjectRepository(Room) private readonly roomRepo: Repository<Room>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendIpLiberado(companyId: string, ipId: string) {
    const company = await this.companyRepo.findOne({
      where: { id: companyId },
      relations: ['room', 'user'],
    });
    if (!company) throw new NotFoundException(`Empresa ${companyId} não encontrada`);
    if (!company.user?.email) throw new BadRequestException('Empresa sem e-mail cadastrado');

    const ip = await this.ipRepo.findOne({ where: { id: ipId }, relations: ['room'] });
    if (!ip) throw new NotFoundException(`IP ${ipId} não encontrado`);

    const subject = `IP liberado: ${ip.address}`;
    const html = `
      <p>Olá ${company.user.name},</p>
      <p>O IP foi liberado e alocado para sua empresa.</p>
      <ul>
        <li><b>IP:</b> ${ip.address}</li>
        <li><b>Sala:</b> ${ip.room?.number ?? '-'}</li>
        <li><b>MAC:</b> ${ip.macAddress ?? '-'}</li>
      </ul>
      <p>Configure o endereço IP no equipamento e mantenha este MAC registrado.</p>
      <p>Atenciosamente,<br/>Administração CIPCEI</p>
    `;
    await this.sendMail(company.user.email, subject, html);
  }

  async sendIpCancelado(companyId: string, ipId: string) {
    const company = await this.companyRepo.findOne({
      where: { id: companyId },
      relations: ['room', 'user'],
    });
    if (!company) throw new NotFoundException(`Empresa ${companyId} não encontrada`);
    if (!company.user?.email) throw new BadRequestException('Empresa sem e-mail cadastrado');

    const ip = await this.ipRepo.findOne({ where: { id: ipId }, relations: ['room'] });
    if (!ip) throw new NotFoundException(`IP ${ipId} não encontrado`);

    const subject = `Cancelamento de IP: ${ip.address}`;
    const html = `
      <p>Olá ${company.user.name},</p>
      <p>Confirmamos o cancelamento do IP em uso.</p>
      <ul>
        <li><b>IP:</b> ${ip.address}</li>
        <li><b>Sala:</b> ${ip.room?.number ?? '-'}</li>
      </ul>
      <p>Se precisar de nova alocação, abra outra solicitação.</p>
      <p>Atenciosamente,<br/>Administração CIPCEI</p>
    `;
    await this.sendMail(company.user.email, subject, html);
  }

  async fetchIncomingEmails(limit = 10) {
    // Stub de recebimento (UC futuro para processar solicitações)
    try {
      const config = {
        imap: {
          user: process.env.MAIL_IMAP_USER,
            password: process.env.MAIL_IMAP_PASS,
            host: process.env.MAIL_IMAP_HOST,
            port: Number(process.env.MAIL_IMAP_PORT ?? 993),
            tls: true,
            authTimeout: 10000,
        },
      };
      const connection = await Imap.connect(config);
      await connection.openBox('INBOX');
      const searchCriteria = ['UNSEEN'];
      const fetchOptions = { bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)'], markSeen: false };
      const messages = await connection.search(searchCriteria, fetchOptions);
      const parsed = messages.slice(0, limit).map(m => {
        const header = m.parts[0].body;
        return {
          from: header.from?.[0],
          subject: header.subject?.[0],
          date: header.date?.[0],
        };
      });
      await connection.end();
      return parsed;
    } catch (e) {
      this.logger.warn(`Falha ao ler emails: ${e.message}`);
      return [];
    }
  }

  private async sendMail(to: string, subject: string, html: string) {
    const from = process.env.MAIL_FROM || 'CIPCEI <no-reply@cipcei.local>';
    await this.transporter.sendMail({ from, to, subject, html });
    this.logger.log(`Email enviado para ${to}: ${subject}`);
  }
}