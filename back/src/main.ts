import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { auth } from 'express-openid-connect';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configura CORS
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Definir la URL de frontend
  console.log({ frontendUrl });

  app.enableCors({
    origin: frontendUrl,  // Asegúrate de que esta URL sea la correcta
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,  // Si usas cookies o autenticación basada en sesiones
    allowedHeaders: 'Authorization,Content-Type, Accept',
    maxAge: 3600,
  });

  app.useGlobalPipes(new ValidationPipe());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("JhonDay")
    .setDescription("Este proyecto es una gestión de turnos de un negocio de servicios técnicos")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  await app.listen(3010);
}

bootstrap();
