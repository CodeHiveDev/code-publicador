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
    const endpoint = this.configService.get<string>('queues.sqs.endpoint');
    const firstQueue = this.configService.get<string>('queues.sqs.names.first');

    return {
      consumers: [
        {
          queueUrl: `${endpoint}/${firstQueue}`,
          name: firstQueue,
        },
      ],
    };
  }
}
