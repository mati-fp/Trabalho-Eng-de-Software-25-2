import { Module } from '@nestjs/common';
import { IpsService } from './ips.service';
import { IpsController } from './ips.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ip } from './entities/ip.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { Company } from 'src/companies/entities/company.entity';
import { IpHistoryModule } from 'src/ip-history/ip-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ip, Room, Company]),
    IpHistoryModule,
  ],
  providers: [IpsService],
  controllers: [IpsController],
  exports: [IpsService]
})
export class IpsModule {}
