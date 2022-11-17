import { forwardRef, Inject, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from '@modules/message/message.module';
import { MessageService } from '@modules/message/services/message.service';
import { RasterModule } from '@modules/raster/raster.module';
import { RasterService } from '@modules/raster/services/raster.service';
import { ShaperModule } from '@modules/shaper/shaper.module';
import { ShaperService } from '@modules/shaper/services/shaper.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './shared/typeorm/typeorm.service';
import { ConfigModule } from '@nestjs/config';
import { getEnvPath } from './helper/env.helper';
import { HelperModule } from './helper/Helper.module';
import { Helper } from './helper/Helper';
import { AwsSdkModule } from 'nest-aws-sdk';
import * as AWS from 'aws-sdk';
import { HttpModule } from '@nestjs/axios';
import { HttpConfigService } from '@services/httpService.config';
import { GeoserverService } from '@services/geoserver.service';
import { HttpService } from '@nestjs/axios';
const envFilePath: string = getEnvPath(`${__dirname}/config/envs`);
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
    }),
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
    HelperModule,
    RasterModule,
    ShaperModule,
    MessageModule,
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
  ],
  controllers: [AppController],
  providers: [AppService, GeoserverService],
})
export class AppModule {
  constructor() {
  }
}
