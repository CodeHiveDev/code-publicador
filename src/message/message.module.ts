import { Module } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { SqsModule } from '@ssut/nestjs-sqs';

import { RasterModule } from '../raster/raster.module';
import { ShapefilesModule } from '../shapefiles/shapefiles.module';
import { MessageService } from './message.service';
import { SqsConfigService } from '../common/helper/sqsConfig.service';

/*
AWS.config.update({
  accessKeyId: this.configService.get<string>('AWS_REGION'), //process.env.ACCESS_KEY_ID, //config.ACCESS_KEY_ID,
  secretAccessKey: //process.env.SECRET_ACCESS_KEY, //config.SECRET_ACCESS_KEY,
  region: //process.env.AWS_REGION, //config.AWS_REGION,
});
*/

@Module({
  imports: [
    SqsModule.registerAsync({
        useClass: SqsConfigService,
      }),
    /*
    SqsModule.register({
      consumers: [
        {
          name: config.QUEUE, // name of the queue
          queueUrl: config.QUEUE_URL, // the url of the queue
          region: config.AWS_REGION,
          messageAttributeNames: ['All'], // can read attributes
        },
      ],
    }),*/
    RasterModule,
    ShapefilesModule,
  ],
  providers: [MessageService],
})
export class MessageModule {}
