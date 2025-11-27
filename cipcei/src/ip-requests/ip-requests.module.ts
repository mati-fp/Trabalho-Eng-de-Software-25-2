import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpRequest } from './entities/ip-request.entity';
import { IpRequestsService } from './ip-requests.service';
import { IpRequestsController } from './ip-requests.controller';
import { Ip } from '../ips/entities/ip.entity';
import { Company } from '../companies/entities/company.entity';
import { IpHistoryModule } from '../ip-history/ip-history.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IpRequest, Ip, Company]),
    IpHistoryModule,
    MailModule,
  ],
  controllers: [IpRequestsController],
  providers: [IpRequestsService],
  exports: [IpRequestsService],
})
export class IpRequestsModule { }