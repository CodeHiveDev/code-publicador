import {
  SqsModuleOptionsFactory,
  SqsOptions,
} from '@ssut/nestjs-sqs/dist/sqs.types';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class SqsConfigService implements SqsModuleOptionsFactory {
  constructor(private configService: ConfigService) {}

  public createOptions(): SqsOptions {
    const endpoint = this.configService.get<string>('QUEUE_URL');
    const firstQueue = this.configService.get<string>('QUEUE');
    const regionQueue = this.configService.get<string>('AWS_REGION');

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