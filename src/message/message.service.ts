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
    const port = this.configService.get<number>('PORT');
    if (!port) {
      throw new Error(`Environment variables are missing`);
    }
    const QUEUE = this.configService.get<string>('QueueService.QUEUE');

    this.queueName = QUEUE;
  }

  @SetMetadata(SQS_CONSUMER_METHOD, { name: 'invap-ho-event-queue-test' })
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
}
