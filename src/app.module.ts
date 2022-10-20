import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import QueueService from './config/db.config';
import postgisService from './config/sqs.config';
import geoserverService from './config/geoserver.config';

import { RasterModule } from './raster/raster.module';
import { RasterService } from './raster/raster.service';
import { ShapefilesService } from './shapefiles/shapefiles.service';
import { ShapefilesModule } from './shapefiles/shapefiles.module';
import { dbHelperModule } from './helper/dbHelper.module';
import { dbHelper } from './helper/dbHelper';
import { MessageService } from './message/message.service';
import { MessageModule } from './message/message.module';
import { getEnvPath } from './common/helper/env.helper';
import { TypeOrmConfigService } from './shared/typeorm/typeorm.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
      load: [configuration],
    }),
    RasterModule,
    dbHelperModule,
    ShapefilesModule,
    MessageModule,
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    dbHelper,
    RasterService,
    ShapefilesService,
    MessageService,
  ],
})
export class AppModule {}
