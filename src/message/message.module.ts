import { Module } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { SqsModule } from '@ssut/nestjs-sqs';
import { config } from '../config';
import { RasterModule } from '../raster/raster.module';
import { ShapefilesModule } from '../shapefiles/shapefiles.module';
import { MessageService } from './message.service';

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
                    messageAttributeNames: ['All'] // can read attributes
                },
            ],
        }),
        RasterModule,
        ShapefilesModule,
    ],
    providers: [MessageService]
})
export class MessageModule {}
