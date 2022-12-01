import { Injectable } from '@nestjs/common';
import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  constructor(private appConfigService: AppConfigService) {}

  createHttpOptions(): HttpModuleOptions {
    const username = this.appConfigService.serverUser;
    const password = this.appConfigService.serverPassword;

    return {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${username}:${password}`,
          'utf8',
        ).toString('base64')}`,
        'Content-Type': `application/xml`,
      },
    };
  }
}
