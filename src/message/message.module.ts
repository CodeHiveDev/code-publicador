import { Module } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { SqsModule } from '@ssut/nestjs-sqs';

import { RasterModule } from '../raster/raster.module';
import { ShapefilesModule } from '../shapefiles/shapefiles.module';
import { MessageService } from './message.service';
import { SqsConfigService } from '../common/helper/sqsConfig.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SqsModule.registerAsync({
      useClass: SqsConfigService,
    }),
    RasterModule,
    ShapefilesModule,
  ],
  providers: [MessageService],
})
export class MessageModule {}
