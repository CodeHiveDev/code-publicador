import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getMessage(): string {
    return 'sqs';
  }
  getHello(): string {
    return 'Hello World!';
  }
}
