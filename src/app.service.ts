import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AppConfigService } from './config/config.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
  ) {}
  async onModuleInit() {
    console.log(
      'ANTES DE EMPEZAR A ESCUCHAR VERIFICO SI EXISTE DATASTORE DE POSTGIS...',
    );
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
            {
              '@key': 'dbtype',
              $: this.appConfigService.datastoreVectores,
            },
          ],
        },
      },
    };

    try {
      const res = this.httpService.post(
        `http://${this.appConfigService.serverHost}/geoserver/rest/workspaces/${this.appConfigService.workspaceVectores}/datastores`,
        dataStore,
        { headers: { 'Content-Type': 'application/json' } },
      );

      const resolved = await lastValueFrom(res);
      return resolved.data;
    } catch (error: any) {
      if (error.response?.data.includes('already exists in workspace')) {
        console.log('Datastore ya existe, continuando...');
        return;
      }
      throw new Error(error);
    }
  }
  getHello(): string {
    return 'Hello World!';
  }

  async initDatastore() {
    return 'Cambiado';
  }
}
