import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (process.env.QUEUE) {
    await app.listen(process.env.PORT ? parseInt(process.env.PORT) : 5000);
  } else {
    console.log('no env file');
  }
}
bootstrap();
