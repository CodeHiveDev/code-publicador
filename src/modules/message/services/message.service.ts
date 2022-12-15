import { Inject, Injectable, forwardRef, SetMetadata } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { RasterService } from '@modules/raster/services/raster.service';
import { ShaperService } from '@modules/shaper/services/shaper.service';
import { AppConfigService } from 'src/config/config.service';

const SQS_CONSUMER_METHOD = Symbol.for('SQS_CONSUMER_METHOD');
@Injectable()
export class MessageService {
  constructor(
    @Inject(forwardRef(() => ShaperService))
    private shaperService: ShaperService,
    @Inject(forwardRef(() => RasterService))
    private rasterService: RasterService,
    private appConfigService: AppConfigService,
  ) {
    const port = this.appConfigService.port;
    if (!port) {
      throw new Error(`Environment variables are missing`);
    }
  }

  @SetMetadata(SQS_CONSUMER_METHOD, { name: 'events-invap-ho-dev' })
  public async MessageHandler(message: AWS.SQS.Message) {
    const sms: any = {};

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

    let pathAndFile = sms.folder + sms.filename + '.' + sms.type;

    // Traer todos los archivos de esa extension
    if (sms.type === 'shp') {
      pathAndFile = pathAndFile.slice(0, -3) + 'zip';
      this.shaperService.shapeHandler(
        pathAndFile,
        sms.filename,
        'Geometry',
        sms.style,
      );
    }
    if (sms.type === 'tif')
      this.rasterService.rasterHandler(
        pathAndFile,
        sms.folder,
        sms.store,
        sms.filename,
        'GeoTIFF',
      );
  }
}
