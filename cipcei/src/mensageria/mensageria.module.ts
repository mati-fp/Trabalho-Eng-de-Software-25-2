import { Module } from '@nestjs/common';
import { MensageriaService } from './mensageria.service';
import { MensageriaController } from './mensageria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../companies/entities/company.entity';
import { Ip } from '../ips/entities/ip.entity';
import { Room } from '../rooms/entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Ip, Room])],
  controllers: [MensageriaController],
  providers: [MensageriaService],
  exports: [MensageriaService],
})
export class MensageriaModule {}