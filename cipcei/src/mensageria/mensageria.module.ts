import { Module } from '@nestjs/common';
import { MensageriaService } from './mensageria.service';
import { MensageriaController } from './mensageria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../companies/entities/company.entity';
import { Ip } from '../ips/entities/ip.entity';
import { Room } from '../rooms/entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Ip, Room])], // registra as entidades pro service poder usar
  controllers: [MensageriaController], // endpoints de email
  providers: [MensageriaService], // lógica de envio/recebimento
  exports: [MensageriaService], // deixa outros módulos usarem (tipo o IpsModule)
})
export class MensageriaModule {}