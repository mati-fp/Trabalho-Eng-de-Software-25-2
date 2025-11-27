import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService, IpRequestEmailData, IpApprovedEmailData, IpRejectedEmailData } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: jest.Mocked<MailerService>;
  let configService: jest.Mocked<ConfigService>;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get(MailerService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendIpRequestConfirmation', () => {
    const mockRequestData: IpRequestEmailData = {
      companyName: 'Empresa Teste',
      companyEmail: 'empresa@teste.com',
      requestType: 'new',
      justification: 'Precisamos de um IP para o novo servidor',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      userName: 'Usuario Teste',
      isTemporary: false,
      expirationDate: undefined,
      requestDate: new Date('2025-11-26'),
    };

    it('should not send email when MAIL_ENABLED is false', async () => {
      mockConfigService.get.mockReturnValue('false');

      // Recreate service to pick up the new config
      const module = await Test.createTestingModule({
        providers: [
          EmailService,
          { provide: MailerService, useValue: mockMailerService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();
      const serviceWithDisabled = module.get<EmailService>(EmailService);

      await serviceWithDisabled.sendIpRequestConfirmation(mockRequestData);

      expect(mockMailerService.sendMail).not.toHaveBeenCalled();
    });

    it('should send email when MAIL_ENABLED is true', async () => {
      mockConfigService.get.mockReturnValue('true');

      const module = await Test.createTestingModule({
        providers: [
          EmailService,
          { provide: MailerService, useValue: mockMailerService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();
      const serviceWithEnabled = module.get<EmailService>(EmailService);

      await serviceWithEnabled.sendIpRequestConfirmation(mockRequestData);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockRequestData.companyEmail,
          subject: expect.stringContaining('Solicitacao de IP Recebida'),
          template: 'ip-request-confirmation',
          context: expect.objectContaining({
            companyName: mockRequestData.companyName,
            requestType: 'Novo IP',
          }),
        }),
      );
    });

    it('should handle email sending errors gracefully', async () => {
      mockConfigService.get.mockReturnValue('true');
      mockMailerService.sendMail.mockRejectedValueOnce(new Error('SMTP error'));

      const module = await Test.createTestingModule({
        providers: [
          EmailService,
          { provide: MailerService, useValue: mockMailerService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();
      const serviceWithEnabled = module.get<EmailService>(EmailService);

      // Should not throw, just log the error
      await expect(serviceWithEnabled.sendIpRequestConfirmation(mockRequestData)).resolves.not.toThrow();
    });
  });

  describe('sendIpApproved', () => {
    const mockApprovedData: IpApprovedEmailData = {
      companyName: 'Empresa Teste',
      companyEmail: 'empresa@teste.com',
      ipAddress: '192.168.1.100',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      userName: 'Usuario Teste',
      requestType: 'new',
      expirationDate: new Date('2026-11-26'),
      approvedAt: new Date('2025-11-26'),
    };

    it('should not send email when MAIL_ENABLED is false', async () => {
      mockConfigService.get.mockReturnValue('false');

      const module = await Test.createTestingModule({
        providers: [
          EmailService,
          { provide: MailerService, useValue: mockMailerService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();
      const serviceWithDisabled = module.get<EmailService>(EmailService);

      await serviceWithDisabled.sendIpApproved(mockApprovedData);

      expect(mockMailerService.sendMail).not.toHaveBeenCalled();
    });

    it('should send email with IP address when MAIL_ENABLED is true', async () => {
      mockConfigService.get.mockReturnValue('true');

      const module = await Test.createTestingModule({
        providers: [
          EmailService,
          { provide: MailerService, useValue: mockMailerService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();
      const serviceWithEnabled = module.get<EmailService>(EmailService);

      await serviceWithEnabled.sendIpApproved(mockApprovedData);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockApprovedData.companyEmail,
          subject: expect.stringContaining('IP Aprovado'),
          template: 'ip-approved',
          context: expect.objectContaining({
            ipAddress: mockApprovedData.ipAddress,
            companyName: mockApprovedData.companyName,
          }),
        }),
      );
    });
  });

  describe('sendIpRejected', () => {
    const mockRejectedData: IpRejectedEmailData = {
      companyName: 'Empresa Teste',
      companyEmail: 'empresa@teste.com',
      requestType: 'new',
      rejectionReason: 'Nao ha IPs disponiveis na sala',
      rejectedAt: new Date('2025-11-26'),
    };

    it('should not send email when MAIL_ENABLED is false', async () => {
      mockConfigService.get.mockReturnValue('false');

      const module = await Test.createTestingModule({
        providers: [
          EmailService,
          { provide: MailerService, useValue: mockMailerService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();
      const serviceWithDisabled = module.get<EmailService>(EmailService);

      await serviceWithDisabled.sendIpRejected(mockRejectedData);

      expect(mockMailerService.sendMail).not.toHaveBeenCalled();
    });

    it('should send email with rejection reason when MAIL_ENABLED is true', async () => {
      mockConfigService.get.mockReturnValue('true');

      const module = await Test.createTestingModule({
        providers: [
          EmailService,
          { provide: MailerService, useValue: mockMailerService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();
      const serviceWithEnabled = module.get<EmailService>(EmailService);

      await serviceWithEnabled.sendIpRejected(mockRejectedData);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockRejectedData.companyEmail,
          subject: expect.stringContaining('Solicitacao de IP Negada'),
          template: 'ip-rejected',
          context: expect.objectContaining({
            rejectionReason: mockRejectedData.rejectionReason,
            companyName: mockRejectedData.companyName,
          }),
        }),
      );
    });

    it('should handle email sending errors gracefully', async () => {
      mockConfigService.get.mockReturnValue('true');
      mockMailerService.sendMail.mockRejectedValueOnce(new Error('SMTP error'));

      const module = await Test.createTestingModule({
        providers: [
          EmailService,
          { provide: MailerService, useValue: mockMailerService },
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();
      const serviceWithEnabled = module.get<EmailService>(EmailService);

      // Should not throw, just log the error
      await expect(serviceWithEnabled.sendIpRejected(mockRejectedData)).resolves.not.toThrow();
    });
  });
});