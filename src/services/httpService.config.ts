import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  private G_HOST: string;
  private G_AUTH: string;

  constructor(
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
  ) {
    this.G_HOST = this.configService.get<string>('SERVER_HOST');
    this.G_AUTH = this.configService.get<string>('SERVER_AUTH');
  }

  createHttpOptions(): HttpModuleOptions {
    return {
      headers: {
        Authorization: `Basic ${process.env.SERVER_AUTH}`,
        'Content-Type': `application/xml`,
      },
    };
  }
}
