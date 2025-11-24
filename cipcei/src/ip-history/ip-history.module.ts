import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpHistory } from './entities/ip-history.entity';
import { IpHistoryService } from './ip-history.service';
import { IpHistoryController } from './ip-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IpHistory])],
  controllers: [IpHistoryController],
  providers: [IpHistoryService],
  exports: [IpHistoryService],
})
export class IpHistoryModule {}