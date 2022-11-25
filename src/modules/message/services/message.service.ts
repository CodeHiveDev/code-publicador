import { Inject, Injectable, forwardRef, SetMetadata } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { RasterService } from '@modules/raster/services/raster.service';
import { ShaperService } from '@modules/shaper/services/shaper.service';
import { AppConfigService } from 'src/config/config.service';

//const mivar2 = process.env.QUEUE
const SQS_CONSUMER_METHOD = Symbol.for('SQS_CONSUMER_METHOD');
@Injectable()
export class MessageService {
  private port: number;
  private queueName: string;

  constructor(
    @Inject(forwardRef(() => ShaperService))
    private ShaperService: ShaperService,
    @Inject(forwardRef(() => RasterService))
    private rasterService: RasterService,
    private appConfigService: AppConfigService,
  ) {
    const port = this.appConfigService.port;
    if (!port) {
      throw new Error(`Environment variables are missing`);
    }
    const QUEUE = this.appConfigService.queue;

    this.queueName = QUEUE;
  }

  @SetMetadata(SQS_CONSUMER_METHOD, { name: 'invap-ho-event-queue-test' })
  //receiveMessage visibilitytimeoout waittime atributes all buscar sequence number deletemessage reciep handle
  public async MessageHandler(message: AWS.SQS.Message) {
    const sms: any = {};
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
      this.ShaperService.shapeHandler(
        Objectfile,
        pathandfile,
        sms.folder,
        sms.filename,
        'Geometry',
      );
    if (sms.type === 'tif')
      this.rasterService.rasterHandler(
        Objectfile,
        pathandfile,
        sms.folder,
        sms.filename,
        'GeoTIFF',
      );
  }
}
