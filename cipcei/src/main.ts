import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('CIPCEI API')
    .setDescription('API para gerenciamento de IPs do Centro de Empreendedorismo e Inovação (CEI) da UFRGS')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticação e autorização')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('companies', 'Gerenciamento de empresas')
    .addTag('rooms', 'Gerenciamento de salas')
    .addTag('ips', 'Gerenciamento de endereços IP')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // Nome do esquema de segurança
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove propriedades não definidas no DTO
    forbidNonWhitelisted: true, // Lança erro se houver propriedades extras
    transform: true, // Transforma os tipos automaticamente
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();