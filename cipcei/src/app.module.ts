import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './companies/companies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IpsModule } from './ips/ips.module';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './/.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'cipcei_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Não em produção
    }),
    CompaniesModule,
    IpsModule,
    RoomsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService
  ],
})
export class AppModule {}
