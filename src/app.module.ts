import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
//import { getEnvPath } from './common/helper/env.helper';

import { RasterModule } from './raster/raster.module';
import { RasterService } from './raster/raster.service';
import { ShapefilesService } from './shapefiles/shapefiles.service';
import { ShapefilesModule } from './shapefiles/shapefiles.module';
import { MessageService } from './message/message.service';
import { MessageModule } from './message/message.module';

//const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
  imports: [
    ConfigModule.forRoot(),
    RasterModule,
    ShapefilesModule,
    MessageModule,
    // ConfigModule.forRoot({ envFilePath: `${process.env.NODE_ENV}.env`, isGlobal: true })
  ],
  controllers: [AppController],
  providers: [AppService, RasterService, ShapefilesService, MessageService],
})
export class AppModule {}
