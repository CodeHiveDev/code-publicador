import { Inject, Injectable } from '@nestjs/common';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
import { config } from '../../config';
import { RasterService } from '../../raster/raster.service';
//import { ItemService } from 'src/item/item.service';

//console.log('config.AWS_REGION', config);
@Injectable()
export class MessageHandler {
    @Inject(RasterService)
    private readonly rasterService: RasterService;
    constructor() { }
    @SqsMessageHandler("invap-ho-event-queue-test", false)
    //receiveMessage visibilitytimeoout waittime atributes all buscar sequence number deletemessage reciep handle 
    public async MessageHandler(message: AWS.SQS.Message) {
        /*const obj: any = JSON.parse(message.Body) as {
            message: string;
            date: string;
        };*/
        //const { data } = JSON.parse(obj.Message);
        this.rasterService.rasterHandler()
        console.log("data_sqs", message.Body)
        // read attributes
        
        // delete 

        // services raster
        var s3 = new AWS.S3
        ({
            accessKeyId: config.ACCESS_KEY_ID,
            secretAccessKey: config.SECRET_ACCESS_KEY,
        });
        var params = {
            Bucket: 'ho-backend-content-dev', 
            Key:  message.Body //'publicador/sat.tif',
        }
        const raster : any = ""
        s3.getObject(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);  this.raster = data;         // successful response
          });

    }
    @SqsConsumerEventHandler(config.QUEUE, /** eventName: */ 'processing_error')
    public onProcessingError(error: Error, message: AWS.SQS.Message) {
      console.log(error)
    }
}