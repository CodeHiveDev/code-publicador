import { Injectable, Logger } from '@nestjs/common';
import { HelperService } from '../../../helper/helper.service';
import { GeoserverService } from '@services/geoserver.service';
import { AppConfigService } from 'src/config/config.service';
import * as AdmZip from 'adm-zip';
import { fromBuffer } from 'file-type';
import { MessageIDE } from 'src/common/validator/message-ide.validator';

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
  public async shapeHandler({
    workspace,
    datastore,
    layerName,
    style,
    path,
    fileName,
  }: MessageIDE) {
    this.logger.log(
      `Iniciando shaperHandler para '${layerName}' con archivo '${fileName}'`,
    );

    if (!fileName) {
      this.logger.error(`Finalizando shaperHandler: archivo no indicado`);
      return;
    }

    workspace = workspace
      ? workspace
      : this.appConfigService.workspaceCatastroMinero;

    // const shpLowerCase = nameShapefile.toLowerCase();
    const zipBody = await this.helperService.downloadFileS3(
      `${path}/${fileName}`,
    );

    if (!zipBody) {
      this.logger.error(`Archivo '${fileName}' no encontrado en S3`);
      this.logger.log('Finalizando shaperHandler');
      return;
    }

    const { capa, inputsGeom } = await this.helperService.getGeometriesAndCapa(
      zipBody,
      layerName,
    );

    if (!capa || !inputsGeom) {
      this.logger.log(`Finalizado sin importar capa: '${fileName}'`);
      return 'done';
    }

    await this.helperService.deleteOldAndSaveNewGeometrias(capa, inputsGeom);

    const layername = await this.geoService.getLayerName(
      layerName,
      workspace,
      datastore,
    );

    if (!layername)
      await this.geoService.publishLayer(layerName, workspace, datastore);

    const styleEntry = await this.geoService.getStyle(`${layerName}_style`);

    if (!styleEntry) {
      if (typeof styleEntry === 'undefined')
        await this.geoService.createStyle(`${layerName}_style`);
      this.logger.warn(
        'Estilo de capa en blanco, actualizando por valor configurado',
      );
      await this.geoService.uploadStyle(capa.style, `${layerName}_style`);
    }

    const zipFile = new AdmZip(zipBody);
    const zipEntries = zipFile.getEntries();
    const styleFile = zipEntries.find(
      (entry) => entry.name.slice(entry.name.length - 3) === 'sld',
    );

    if (styleFile) {
      this.logger.log('Archivo de estilos .sld encontrado en .zip');
      const styleData = styleFile.getData();
      const styleType = await fromBuffer(styleData);

      if (styleType.mime !== 'application/xml')
        this.logger.error('Tipo de documento SLD no es XML');
      else {
        const stypeString = styleData.toString();
        await this.geoService.uploadStyle(stypeString, `${layerName}_style`);
      }
    } else {
      this.logger.warn('Archivo de estilos .sld NO encontrado');
    }

    // Apply Style
    const styleName = style ? style : `${layerName}_style`;
    await this.geoService.setLayerStyle(layerName, styleName, workspace);

    this.logger.log(`Finalizado e importado shaperHandler para '${fileName}'.`);

    return 'done';
  }
}
