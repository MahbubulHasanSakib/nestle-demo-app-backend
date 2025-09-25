import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Constants } from './utils/constants';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { globalValidationPipe } from './utils/global.validation';
import helmet from 'helmet';
import * as requestIp from 'request-ip';
import * as basicAuth from 'express-basic-auth';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.use(requestIp.mw());
  app.use(helmet());
  const configService = app.get(ConfigService);

  app.setGlobalPrefix(Constants.API);

  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  app.useGlobalPipes(globalValidationPipe);

  app.use(
    '/docs',
    basicAuth({ challenge: true, users: { admin: 'hdml@1230' } }),
  );

  const config = new DocumentBuilder()
    .setTitle('M-Lenz')
    .setDescription('M-Lenz API description')
    .setVersion('1.0')
    .addTag('unilever')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = configService.get<number>('PORT');
  await app.listen(port, () => console.log(`Server running at port ${port}`));
}
bootstrap();
