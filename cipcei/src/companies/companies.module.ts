import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { RoomsModule } from 'src/rooms/rooms.module';
import { Room } from 'src/rooms/entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Room]),
    RoomsModule
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService]
})
export class CompaniesModule {}
