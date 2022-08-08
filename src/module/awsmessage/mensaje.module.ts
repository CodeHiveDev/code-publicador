import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { MessageHandler } from './message.handler';
import * as AWS from 'aws-sdk';
import { config } from '../../config';
import { RasterModule } from '../../raster/raster.module';

AWS.config.update({
  region: config.AWS_REGION,
  accessKeyId: config.ACCESS_KEY_ID,
  secretAccessKey: config.SECRET_ACCESS_KEY,
});
@Module({
  imports: [
    SqsModule.register({
      consumers: [
        {
          name: config.QUEUE, // name of the queue
          queueUrl: config.QUEUE_URL, // the url of the queue
          region: config.AWS_REGION,
        },
      ],
    }),
    RasterModule,
  ],
  controllers: [],
  providers: [MessageHandler],
})
export class MensajeModule {}
