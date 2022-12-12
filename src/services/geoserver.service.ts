import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import console = require('console');
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class GeoserverService {
  private WORKSPACE: string;
  private STORE: string;
  private readonly logger = new Logger(GeoserverService.name);
  constructor(
    // TODO: forwardRef eliminado 3 @Inject(forwardRef(() => ConfigService))
    private appConfigService: AppConfigService,
    private httpService: HttpService,
  ) {
    this.WORKSPACE = this.appConfigService.workspaceRaster;
    this.STORE = this.appConfigService.datastoreRaster;
  }
  host = this.appConfigService.serverHost;

  async getLayerName(layername: string, workspace: string, datastore: string) {
    try {
      this.logger.log(`Verificando si capa '${layername}' existe`);
      const { data } = await firstValueFrom(
        this.httpService.get(
          `http://${this.host}/geoserver/rest/workspaces/${workspace}/datastores/${datastore}/featuretypes/${layername}.json`,
        ),
      );
      this.logger.log(`Capa '${layername}' YA existe`);
      return data;
    } catch (e) {
      if (e.response.status === 404) {
        this.logger.log(`Capa '${layername}' NO existe`);
      } else {
        this.logger.error(
          `- Error getLayerName - ${e.message}: ${e.response?.data}`,
        );
      }
      return;
    }
  }

  async publishLayer(
    layername: string,
    type: string,
    workspace: string,
    datastore: string,
  ) {
    try {
      this.logger.log(`Creando capa '${layername}'`);

      const dataLayer = {
        featureType: {
          name: layername,
          namespace: { name: workspace },
          title: layername,
        },
      };

      const { data } = await firstValueFrom(
        this.httpService.post(
          `http://${this.host}/geoserver/rest/workspaces/${workspace}/datastores/${datastore}/featuretypes`,
          dataLayer,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      this.logger.log(`Nueva capa creada: ${layername}`);
      return data;
    } catch (e) {
      this.logger.error(
        `- Error publishLayer - ${e.message}: ${e.response?.data}`,
      );
      return true;
    }
  }

  async getStyle(stylename: string) {
    try {
      this.logger.log(`Verificando si estilo '${stylename}' existe`);
      const { data } = await firstValueFrom(
        this.httpService.get(
          `http://${this.host}/geoserver/rest/styles/${stylename}.sld`,
        ),
      );
      this.logger.log(`Estilo '${stylename}' YA existe`);
      return data;
    } catch (e) {
      if (e.response.status === 404) {
        this.logger.log(`Estilo '${stylename}' NO existe`);
      } else {
        this.logger.error(
          `- Error getStyle - ${e.message}: ${e.response?.data}`,
        );
      }
      return;
    }
  }
  async createStyle(layerName: string) {
    try {
      this.logger.log(`Creando estilo '${layerName}'`);
      const dataStyle = `<style><name>${layerName}</name><filename>${layerName}.sld</filename></style>`;

      const { data } = await firstValueFrom(
        this.httpService.post(
          `http://${this.host}/geoserver/rest/styles`,
          dataStyle,
        ),
      );

      this.logger.log(`Estilo creado: '${layerName}'`);
      return data;
    } catch (e) {
      this.logger.error(
        `- Error createStyle - ${e.message}: ${e.response?.data}`,
      );

      return;
    }
  }
  async uploadStyle(styleString: string, styleName: string) {
    try {
      this.logger.log(`Subiendo estilo '${styleName}'`);
      const { data } = await firstValueFrom(
        this.httpService.put(
          `http://${this.host}/geoserver/rest/styles/${styleName}`,
          styleString,
          { headers: { 'Content-Type': `application/vnd.ogc.sld+xml` } },
        ),
      );

      this.logger.log(`Estilo subido: '${styleName}'`);
      return data;
    } catch (e) {
      this.logger.error(
        `- Error uploadStyle - ${e.message}: ${e.response?.data}`,
      );
      return;
    }
  }

  async setLayerStyle(layerName: string, styleName: string, workspace: string) {
    try {
      this.logger.log(`Aplicando estilo '${styleName}' en capa '${layerName}'`);
      const dataStyle = `<layer><defaultStyle><name>${styleName}</name></defaultStyle></layer>`;
      const { data } = await firstValueFrom(
        this.httpService.put(
          `http://${this.host}/geoserver/rest/layers/${workspace}:${layerName}`,
          dataStyle,
        ),
      );

      this.logger.log(`Estilo '${styleName}' aplicado en capa '${layerName}'`);
      return data;
    } catch (e) {
      this.logger.error(
        `- Error setLayerStyle - ${e.message}: ${e.response?.data}`,
      );

      return;
    }
  }
  async publishRaster(file: any, type: any) {
    try {
      const datafile = `${this.WORKSPACE}/${this.STORE}/${file}`;

      const { data, status } = await firstValueFrom(
        this.httpService.post(
          `http://${this.host}/geoserver/rest/workspaces/${this.WORKSPACE}/coveragestores/${this.STORE}/external.imagemosaic?recalculate=nativebbox,latlonbbox`,
          datafile,
          { headers: { 'Content-Type': `text/plain` } },
        ),
      );
      return data;
    } catch (e) {
      console.log('Error PublishLayer: ', e.message);

      return true;
    }
  }

  async uploadRaster(file: any, type: any, store: any) {
    try {
      const pathfile = `${this.WORKSPACE}/${store}/${file}`;

      const fileZip = fs.createReadStream(`${file}`);

      const { data, status } = await firstValueFrom(
        this.httpService.post(
          `http://${this.host}/geoserver/rest/workspaces/${this.WORKSPACE}/coveragestores/${store}/file.imagemosaic?configure=false`,
          fileZip,
          {
            headers: { 'Content-Type': `application/zip` },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          },
        ),
      );
      console.log('UploadRaster => OK', data);
      return data;
    } catch (e) {
      console.log('Error uploadRaster: ', e.message);

      return true;
    }
  }

  async updateRaster(file: any, store: any) {
    try {
      const pathfile = `${this.WORKSPACE}/${store}/${file}`;

      const rasterPath = file;

      for (let i = 0; i < 4; i++) {
        console.log(`Waiting ${i} seconds...`);
        await sleep(i * 10000);
      }

      const { data, status } = await firstValueFrom(
        this.httpService.put(
          `http://${this.host}/geoserver/rest/workspaces/${this.WORKSPACE}/coveragestores/${store}/external.imagemosaic`,
          rasterPath,
          { headers: { 'Content-Type': `text/plain` } },
        ),
      );
      console.log('Update Raster => OK');

      return data;
    } catch (e) {
      console.log('Error uodateRaster: ', e.message);

      return true;
    }
  }

  async updateRaster2(file: any, store: any) {
    try {
      //const pathfile = `${this.WORKSPACE}/${store}/${file}`;

      const rasterPath = file;
      console.log('rasterPath', rasterPath);

      const { data, status } = await firstValueFrom(
        this.httpService.post(
          `http://${this.host}/geoserver/rest/workspaces/${this.WORKSPACE}/coveragestores/${store}/external.imagemosaic?recalculate=nativebbox,latlonbbox`,
          rasterPath,
          { headers: { 'Content-Type': `text/plain` } },
        ),
      );
      console.log('Update Raster => OK');

      return data;
    } catch (e) {
      console.log('Error uodateRaster: ', e.message);

      return true;
    }
  }

  async setConfigRaster(store: any) {
    try {
      const coverage =
        '<coverage>\
      <enabled>true</enabled>\
      <metadata><entry key="time">\
      <dimensionInfo>\
      <enabled>true</enabled>\
      <presentation>CONTINUOUS_INTERVAL</presentation>\
      <units>ISO8601</units><defaultValue/>\
      </dimensionInfo>\
      </entry></metadata>\
      </coverage>';

      const { data, status } = await firstValueFrom(
        this.httpService.put(
          `http://${this.host}/geoserver/rest/workspaces/${this.WORKSPACE}/coveragestores/${store}/coverages/${store}`,
          coverage,
          { headers: { 'Content-Type': `application/xml` } },
        ),
      );
      return data;
    } catch (e) {
      console.log('Error setConfigRaster: ', e.message);

      return true;
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
