import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { RoomsModule } from 'src/rooms/rooms.module';
import { Room } from 'src/rooms/entities/room.entity';
import { User } from 'src/users/entities/user.entity';
import { Ip } from 'src/ips/entities/ip.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Room, User, Ip]),
    RoomsModule
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService]
})
export class CompaniesModule {}
