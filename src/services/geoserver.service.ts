import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import path = require('path');
import { renderFile } from 'template-file';

@Injectable()
export class GeoserverService {
  private TPLDIR: string;
  constructor(
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.TPLDIR = path.join(__dirname, '..', 'modules', 'shaper', 'tpl');
    console.log('this.TPLDIR', this.TPLDIR);
  }
  host = this.configService.get<string>('SERVER_HOST');

  async getLayerName(layername: any) {
    const { data, status } = await firstValueFrom(
      this.httpService.get(
        `http://${this.host}/geoserver/rest/workspaces/Mineria/datastores/postgis/featuretypes/${layername}.xml`,
      ),
    );
    if (status == 200) {
      return data;
    }
  }

  async publishLayer(layername: any, type: any) {
    const dataType = {
      nameshapefile: layername,
      G_HOST: this.host,
      type: type,
    };
    const datas = await renderFile(`${this.TPLDIR}/featureType.tpl`, dataType);
    const { data, status } = await firstValueFrom(
      this.httpService.post(
        `http://${this.host}/geoserver/rest/workspaces/Mineria/datastores/postgis/featuretypes`,
        datas,
      ),
    );
    if (status == 200) {
      return data;
    }
  }

  async getStyle(layername: any) {
    const { data, status } = await firstValueFrom(
      this.httpService.get(
        `http://${this.host}/geoserver/rest/styles/${layername}.sld`,
      ),
    );
    console.log(status);
    if (status == 200) {
      return data;
    }
  }
  async createStyle(layername: any) {
    const dataStyle = `<style><name>${layername}</name><filename>${layername}.sld</filename></style>`;

    const { data, status } = await firstValueFrom(
      this.httpService.post(
        `http://${this.host}/geoserver/rest/styles`,
        dataStyle,
      ),
    );
    if (status == 200) {
      return data;
    }
  }
  async uploadStyle(sldfile: any, nameshapefile: any) {
    try {
      const style = fs.readFileSync(sldfile, { encoding: 'utf-8' });
      const { data, status } = await firstValueFrom(
        this.httpService.put(
          `http://${this.host}/geoserver/rest/styles/${nameshapefile}`,
          style,
        ),
      );

      if (status == 200) {
        return data;
      }
    } catch (e) {
      console.log(e);
    }
  }
}
