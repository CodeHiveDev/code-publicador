import { Injectable, Logger } from '@nestjs/common';
import path = require('path');
import os = require('os');
import { HelperService } from '../../../helper/helper.service';
import { GeoserverService } from '@services/geoserver.service';
import { AppConfigService } from 'src/config/config.service';
import AdmZip from 'adm-zip';

@Injectable()
export class ShaperService {
  private G_HOST: string;
  private TEMDIR: string;
  private readonly logger = new Logger(ShaperService.name);
  constructor(
    // TODO: eliminado forwardRed 2
    private appConfigService: AppConfigService,
    private geoService: GeoserverService,
    private helperService: HelperService,
  ) {
    this.G_HOST = this.appConfigService.serverHost;

    // get temp directory
    this.TEMDIR = os.tmpdir(); // /tmp
    // this.TPLDIR = path.join(__dirname, '..', '..', 'tpl');

    if (!this.G_HOST) {
      throw new Error(`GEOSERVER variables are missing`);
    }
  }
  public async shapeHandler(
    pathAndFile: string,
    folders3: string,
    nameShapefile: string,
    type: string,
  ) {
    this.logger.log(`Iniciando shaperHandler para '${nameShapefile}'`);

    const shpLowerCase = nameShapefile.toLowerCase();
    const zipBody = await this.helperService.downloadFileS3(pathAndFile);

    const { capa, inputsGeom } = await this.helperService.getGeometriesAndCapa(
      zipBody,
      shpLowerCase,
    );

    const { inserted, deleted } =
      await this.helperService.deleteOldAndSaveNewGeometrias(capa, inputsGeom);
    this.logger.log(
      `Elimnados ${deleted} filas e insertadas ${inserted} filas`,
    );

    const layername = await this.geoService.getLayerName(shpLowerCase);

    if (!layername) await this.geoService.publishLayer(shpLowerCase, type);

    const stylename = await this.geoService.getStyle(`${shpLowerCase}_style`);

    if (!stylename) await this.geoService.createStyle(`${shpLowerCase}_style`);

    const zipFile = new AdmZip(zipBody);
    console.log('1. zipFile:', zipFile);

    const sldfile = path.join(this.TEMDIR, folders3, `${shpLowerCase}.sld`);
    console.log(sldfile);
    await this.geoService.uploadStyle(sldfile, `${shpLowerCase}_style`);

    // Apply Style
    await this.geoService.setLayerStyle(shpLowerCase, `${shpLowerCase}_style`);

    // const tempdelete = path.join(this.TEMDIR, folders3);

    //await fs.rmSync(tempdelete, { recursive: true, force: true });

    // Delete layer if need
    // DELETE http://<url>/geoserver/rest/workspaces/<workspaceName>/coveragestores/<storeName>/coverages/<layerName>?recurse=true
    return 'done';
  }
}
