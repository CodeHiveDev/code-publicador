import { Injectable, Logger } from '@nestjs/common';
import { HelperService } from '../../../helper/helper.service';
import { GeoserverService } from '@services/geoserver.service';
import { AppConfigService } from 'src/config/config.service';
import * as AdmZip from 'adm-zip';
import { fromBuffer } from 'file-type';

@Injectable()
export class ShaperService {
  private G_HOST: string;
  private readonly logger = new Logger(ShaperService.name);
  constructor(
    private appConfigService: AppConfigService,
    private geoService: GeoserverService,
    private helperService: HelperService,
  ) {
    this.G_HOST = this.appConfigService.serverHost;

    if (!this.G_HOST) {
      throw new Error(`GEOSERVER variables are missing`);
    }
  }
  public async shapeHandler(
    pathAndFile: string,
    nameShapefile: string,
    type: string,
    style?: string,
  ) {
    this.logger.log(`Iniciando shaperHandler para '${nameShapefile}'`);

    const shpLowerCase = nameShapefile.toLowerCase();
    const zipBody = await this.helperService.downloadFileS3(pathAndFile);

    if (!zipBody) {
      this.logger.error(`Archivo ${nameShapefile}.zip no encontrado en S3`);
      this.logger.log('Finalizando shaperHandler');
      return;
    }

    const { capa, inputsGeom } = await this.helperService.getGeometriesAndCapa(
      zipBody,
      shpLowerCase,
    );

    if (!capa || !inputsGeom) {
      this.logger.log(`Finalizado sin importar capa: '${nameShapefile}'`);
      return 'done';
    }

    await this.helperService.deleteOldAndSaveNewGeometrias(capa, inputsGeom);

    const layername = await this.geoService.getLayerName(
      shpLowerCase,
      this.appConfigService.workspaceCatastroMinero,
      this.appConfigService.datastoreCatastroMinero,
    );

    if (!layername)
      await this.geoService.publishLayer(
        shpLowerCase,
        type,
        this.appConfigService.workspaceCatastroMinero,
        this.appConfigService.datastoreCatastroMinero,
      );

    const styleEntry = await this.geoService.getStyle(`${shpLowerCase}_style`);

    if (!styleEntry) {
      if (typeof styleEntry === 'undefined')
        await this.geoService.createStyle(`${shpLowerCase}_style`);
      this.logger.warn(
        'Estilo de capa en blanco, actualizando por valor configurado',
      );
      await this.geoService.uploadStyle(capa.style, `${shpLowerCase}_style`);
    }

    const zipFile = new AdmZip(zipBody);
    const styleFile = zipFile.getEntry(`${nameShapefile}.sld`);

    if (styleFile) {
      this.logger.log('Archivo de estilos .sld encontrado en .zip');
      const styleData = styleFile.getData();
      const styleType = await fromBuffer(styleData);

      if (styleType.mime !== 'application/xml')
        this.logger.error('Tipo de documento SLD no es XML');
      else {
        const stypeString = styleData.toString();
        await this.geoService.uploadStyle(stypeString, `${shpLowerCase}_style`);
      }
    } else {
      this.logger.warn('Archivo de estilos .sld NO encontrado');
    }

    // Apply Style
    const styleName = style ? style : `${shpLowerCase}_style`;
    await this.geoService.setLayerStyle(
      shpLowerCase,
      styleName,
      this.appConfigService.workspaceCatastroMinero,
    );

    this.logger.log(
      `Finalizado e importado shaperHandler para '${nameShapefile}'.`,
    );

    return 'done';
  }
}
