import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    // Enable CORS for frontend
    app.enableCors({
      origin: ['http://localhost:3001', 'http://localhost:3000'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });


    
  app.useGlobalPipes(new ValidationPipe({
      // whitelist: true, // Remove propriedades não definidas no DTO
      // forbidNonWhitelisted: true, // Lança erro se houver propriedades extras
      // transform: true, // Transforma os tipos automaticamente
    }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
