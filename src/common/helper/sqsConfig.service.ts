import {
  SqsModuleOptionsFactory,
  SqsOptions,
} from '@ssut/nestjs-sqs/dist/sqs.types';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SqsConfigService implements SqsModuleOptionsFactory {
  constructor(private configService: ConfigService) {}

  public createOptions(): SqsOptions {
    const endpoint = this.configService.get<string>('QueueService.QUEUE_URL');
    const firstQueue = this.configService.get<string>('QueueService.QUEUE');
    const regionQueue = this.configService.get<string>(
      'QueueService.AWS_REGION',
    );
    const accesKey = this.configService.get<string>(
      'QueueService.ACCESS_KEY_ID',
    );
    const secretKey = this.configService.get<string>(
      'QueueService.SECRET_ACCESS_KEY',
    );

    return {
      consumers: [
        {
          queueUrl: endpoint, //`${endpoint}/${firstQueue}`,
          name: firstQueue,
          region: regionQueue,
          messageAttributeNames: ['All'],
        },
      ],
    };
  }
}
