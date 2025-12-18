import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix('/api');
  app.enableCors();
  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle('Whatsapp Morning Call')
    .setDescription('Equipe BugBusters - Hackathon Voomp 2025')
    .setVersion('1.0')
    .addBasicAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
