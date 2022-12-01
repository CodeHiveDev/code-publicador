import {
  SqsModuleOptionsFactory,
  SqsOptions,
} from '@ssut/nestjs-sqs/dist/sqs.types';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class SqsConfigService implements SqsModuleOptionsFactory {
  constructor(private appConfigService: AppConfigService) {}

  public createOptions(): SqsOptions {
    const endpoint = this.appConfigService.queueUrl;
    const firstQueue = this.appConfigService.queue;
    const regionQueue = this.appConfigService.awsRegion;

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
