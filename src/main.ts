import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  require('module-alias/register');
  const app: NestExpressApplication = await NestFactory.create(AppModule);
  const appConfig: AppConfigService = app.get(AppConfigService);
  const port: number = appConfig.port ? appConfig.port : 5000;

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(port, () => {
    console.log('[INVAP Publicador]', appConfig.baseUrl);
  });
}

bootstrap();
