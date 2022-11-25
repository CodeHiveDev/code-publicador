import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getEnvPath } from 'src/common/utils/get-env-path';
import { AppConfigService } from './config.service';
import configuration from './configuration';

const envFilePath: string = getEnvPath(`${__dirname}/envs`);
console.log('estoy aqui', envFilePath);

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      load: [configuration],
    }),
  ],
  providers: [ConfigService, AppConfigService],
  exports: [ConfigService, AppConfigService],
})
export class AppConfigModule {}
