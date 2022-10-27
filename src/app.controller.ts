import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as AWS from 'aws-sdk';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    AWS.config.update({
      //accessKeyId: process.env.ACCESS_KEY_ID, //config.ACCESS_KEY_ID,
      //secretAccessKey: process.env.SECRET_ACCESS_KEY, //config.SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION, //config.AWS_REGION,
    });
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
