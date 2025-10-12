import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { IpsModule } from 'src/ips/ips.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), IpsModule],
  controllers: [RoomsController],
  providers: [RoomsService]
})
export class RoomsModule {}
