import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AppConfigService } from './config/config.service';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async initDatastore() {
    const dataStore = {
      dataStore: {
        name: 'postgis',
        description:
          'Datastore basado en Postgis para las capas del Catastro Minero',
        connectionParameters: {
          entry: [
            {
              '@key': 'host',
              $: this.appConfigService.postgresHost,
            },
            { '@key': 'port', $: this.appConfigService.postgresPort },
            { '@key': 'database', $: this.appConfigService.postgresDb },
            { '@key': 'user', $: this.appConfigService.postgresUser },
            { '@key': 'passwd', $: this.appConfigService.pgPassword },
            { '@key': 'dbtype', $: 'postgis' },
          ],
        },
      },
    };

    try {
      const res = this.httpService.post(
        `http://${this.appConfigService.serverHost}/geoserver/rest/workspaces/${this.appConfigService.workspace}/datastores`,
        dataStore,
        { headers: { 'Content-Type': `application/json` } },
      );

      const resolved = await lastValueFrom(res);
      return resolved.data;
    } catch (error: any) {
      throw new HttpException(
        {
          statusCode: error.response.status,
          message: error.message,
          error: error.response.statusText + ': ' + error.response.data,
        },
        error.response.status,
      );
    }
  }
}
