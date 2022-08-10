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
import { MessageService } from './message/message.service';
import { MessageModule } from './message/message.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [QueueService, postgisService, geoserverService]
    }),
    RasterModule,
    ShapefilesModule,
    MessageModule
  ],
  controllers: [AppController],
  providers: [AppService, RasterService, ShapefilesService, MessageService],
})
export class AppModule {}
