import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class GeoserverService {
  constructor(
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}
  host = this.configService.get<string>('SERVER_HOST');

  async getLayerName(layername: any) {
    const { data, status } = await firstValueFrom(
      this.httpService.get(
        `http://${this.host}/geoserver/rest/workspaces/Mineria/datastores/postgis/featuretypes/${layername}.xml`,
      ),
    );
    console.log(status);
    return data;
  }

  async publishLayer(layername: any) {
    const { data, status } = await firstValueFrom(
      this.httpService.post(
        `http://${this.host}/geoserver/rest/workspaces/Mineria/datastores/postgis/featuretypes`,
      ),
    );
    console.log(status);
    return data;
  }
}
