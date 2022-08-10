import { Inject, Injectable, forwardRef, SetMetadata } from '@nestjs/common';
import { SqsMessageHandler, SqsConsumerEventHandler } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
import { RasterService } from '../raster/raster.service';
import { ShapefilesService } from '../shapefiles/shapefiles.service';
import { ConfigService } from '@nestjs/config';

//const mivar2 = process.env.QUEUE
const SQS_CONSUMER_METHOD = Symbol.for('SQS_CONSUMER_METHOD');

@Injectable()
export class MessageService {
    private port: number;
    private queueName: string;
    
  constructor(
    @Inject(forwardRef(() => ShapefilesService))
    private shapefilesService: ShapefilesService,
    @Inject(forwardRef(() => RasterService))
    private rasterService: RasterService,
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
  ) {
    const port = this.configService.get<number>('port');
    if (!port) {
        throw new Error(`Environment variables are missing`);
      }
    const QUEUE = this.configService.get<string>('QueueService.QUEUE');

    this.queueName = QUEUE;
      /*
    AWS.config.update({
        accessKeyId: 'AKIAST2MOODF2J3Q2WEE', // this.configService.get<string>('QueueService.AWS_REGION'), //process.env.ACCESS_KEY_ID, //config.ACCESS_KEY_ID,
        secretAccessKey: '7+5W7DLGOVD3QK9OK8GA9+3EvI2ElV68ZAlSR3Gm', // this.configService.get<string>('QueueService.SECRET_ACCESS_KEY'), //process.env.SECRET_ACCESS_KEY, //config.SECRET_ACCESS_KEY,
        region: "us-east-1", // this.configService.get<string>('QueueService.AWS_REGION'), //process.env.AWS_REGION, //config.AWS_REGION,
    });
    */
  }
  //@SqsMessageHandler(mivar2 + '', false) // 'invap-ho-event-queue-test' // process.env.QUEUE,
  
  @SetMetadata(SQS_CONSUMER_METHOD, {name:  'invap-ho-event-queue-test',} )
  //receiveMessage visibilitytimeoout waittime atributes all buscar sequence number deletemessage reciep handle
  public async MessageHandler(message: AWS.SQS.Message) {
    
    

    let sms: any = {};
    // read attributes
    message.MessageAttributes &&
      Object.keys(message.MessageAttributes).forEach((attribute) => {
        if (message.MessageAttributes[attribute].DataType === 'String') {
          sms[attribute] = message.MessageAttributes[attribute].StringValue;
        } else if (message.MessageAttributes[attribute].DataType === 'Number') {
          sms[attribute] = +message.MessageAttributes[attribute].StringValue;
        } else if (
          message.MessageAttributes[attribute].DataType === 'Boolean'
        ) {
          sms[attribute] =
            message.MessageAttributes[
              attribute
            ].StringValue[0].toLowerCase() === 't';
        }
      });

    // delete message

    // services raster or shapefile
    const Objectfile = ''; //await this.getRasterObject(sms.folder, sms.filename, sms.type)
    const pathandfile = sms.folder + sms.filename + '.' + sms.type;

    // Traer todos los archivos de esa extension
    if (sms.type === 'shp')
      this.shapefilesService.shapeHandler(
        Objectfile,
        pathandfile,
        sms.folder,
        sms.filename,
        'Geometry',
      );
    if (sms.type === 'tiff')
      this.rasterService.rasterHandler(
        Objectfile,
        pathandfile,
        sms.folder,
        sms.filename,
        'GeoTIFF',
      );
  }
  getRasterObject(folder, filename, type) {
    var s3 = new AWS.S3({
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    });
    var params = {
      Bucket: 'ho-backend-content-dev',
      Key: folder + filename + '.' + type, //message.Body //'publicador/sat.tif',
    };
    console.log('param', params);
    return new Promise((resolve, reject) => {
      s3.getObject(params, (err, data) => {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject(err.message);
        } else {
          // successful response
          console.log(data);
          resolve(data);
        }
      });
    });
  }
}
