import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('app.port');
  }

  get baseUrl(): string {
    return this.configService.get<string>('app.baseUrl');
  }

  get queue(): string {
    return this.configService.get<string>('app.queue');
  }

  get queueUrl(): string {
    return this.configService.get<string>('app.queueUrl');
  }

  get awsRegion(): string {
    return this.configService.get<string>('app.awsRegion');
  }

  get accessKeyId(): string {
    return this.configService.get<string>('app.accessKeyId');
  }

  get secretAccessKey(): string {
    return this.configService.get<string>('app.secretAccessKey');
  }

  get postgresPort(): number {
    return this.configService.get<number>('app.postgresPort');
  }

  get postgresHost(): string {
    return this.configService.get<string>('app.postgresHost');
  }

  get postgresUser(): string {
    return this.configService.get<string>('app.postgresUser');
  }

  get postgresDb(): string {
    return this.configService.get<string>('app.postgresDb');
  }

  get pgPassword(): string {
    return this.configService.get<string>('app.pgPassword');
  }

  get serverHost(): string {
    return this.configService.get<string>('app.serverHost');
  }

  get serverUser(): string {
    return this.configService.get<string>('app.serverUser');
  }

  get serverPassword(): string {
    return this.configService.get<string>('app.serverPassword');
  }

  get bucketName(): string {
    return this.configService.get<string>('app.bucketName');
  }

  get workspaceRaster(): string {
    return this.configService.get<string>('app.workspaceRaster');
  }

  get datastoreRaster(): string {
    return this.configService.get<string>('app.datastoreRaster');
  }

  get workspaceVectores(): string {
    return this.configService.get<string>('app.workspaceVectores');
  }

  get datastoreVectores(): string {
    return this.configService.get<string>('app.datastoreVectores');
  }
}
