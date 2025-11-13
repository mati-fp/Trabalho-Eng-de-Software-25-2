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
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { MensageriaModule } from './mensageria/mensageria.module';

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
    MensageriaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // JwtAuthGuard executa PRIMEIRO
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // RolesGuard executa DEPOIS (ordem importa!)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
