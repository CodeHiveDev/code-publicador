import { Injectable } from '@nestjs/common';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
import { config } from '../../config';
import { RasterService } from '../../raster/raster.service';
//import { ItemService } from 'src/item/item.service';

//console.log('config.AWS_REGION', config);
@Injectable()
export class MessageHandler {
  constructor(private readonly rasterService: RasterService) {}
  private raster = '';
  //private mess : Message[];
  @SqsMessageHandler('invap-ho-event-queue-test', false)
  //receiveMessage visibilitytimeoout waittime atributes all buscar sequence number deletemessage reciep handle
  public async MessageHandler(message: AWS.SQS.Message, rast: string) {
    /*const obj: any = JSON.parse(message.Body) as {
            message: string;
            date: string;
        };*/
    //const { data } = JSON.parse(obj.Message);

    console.log('data_sqs', message.Body);
    // read attributes

    // delete

    // services raster
    const s3 = new AWS.S3({
      credentials: new AWS.SharedIniFileCredentials({ profile: 'invap' }),
    });
    const params = {
      Bucket: 'ho-backend-content-dev',
      Key: message.Body, //'publicador/sat.tif',
    };
    const raster: any = '';
    await s3.getObject(params, function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
        // successful response
        console.log(data);
        this.raster = data;
        return this.raster;
      }
    });
    console.log(this.rasterService);
    rast = this.rasterService.rasterHandler(this.raster);
  }

  @SqsConsumerEventHandler(config.QUEUE, /** eventName: */ 'processing_error')
  public onProcessingError(error: Error, message: AWS.SQS.Message) {
    console.log(error);
  }
}
