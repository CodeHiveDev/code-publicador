import { Injectable, Logger } from '@nestjs/common';
import { HelperService } from '../../../helper/helper.service';
import { GeoserverService } from '@services/geoserver.service';
import { AppConfigService } from 'src/config/config.service';
import * as AdmZip from 'adm-zip';
import { fromBuffer } from 'file-type';
import { MessageIDE } from 'src/common/validator/message-ide.validator';
import { capasCatastroMinero } from 'src/common/constants/capas-catastro-minero';
import { capasProductosSatelitales } from 'src/common/constants/capas-productos-satelitales';
import { numberToDate } from 'src/common/utils/number-to-date';
import { Capa } from 'src/common/interfaces/capas.interface';
import { KEYWORDS } from 'src/common/constants/keywords-geoserver';

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
  public async shapeHandlerCM({
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

    const zipBody = await this.helperService.downloadFileS3(
      `${path}/${fileName}`,
    );

    if (!zipBody) {
      this.logger.error(`Archivo '${fileName}' no encontrado en S3`);
      this.logger.log('Finalizando shaperHandler');
      return;
    }

    const { capa, inputsGeom } = await this.helperService.getGeometriasAndCapa(
      zipBody,
      layerName,
      capasCatastroMinero,
    );

    if (!capa || !inputsGeom) {
      this.logger.log(`Finalizado sin importar capa: '${fileName}'`);
      return 'done';
    }

    if (!(await this.geoService.checkDSPostgis(workspace, datastore))) {
      this.logger.error(`No es posible usar ${workspace}:${datastore}`);
      return;
    }

    await this.helperService.deleteOldAndSaveNewGeometrias(capa, inputsGeom);

    const layername = await this.geoService.getLayerName(
      layerName,
      workspace,
      datastore,
    );

    if (!layername)
      await this.geoService.publishLayer(layerName, workspace, datastore, [
        KEYWORDS.CATASTRO_MINERO,
      ]);

    // Se verifica la existencia del estilo para la capa y su data
    const styleEntry = await this.geoService.getStyle(`${layerName}_style`);

    // Se verifica si el estilo seleccionado no existe o existe pero es vacío
    if (!styleEntry) {
      // En caso de no existir (undefined), se crea un estilo con el nombre
      if (typeof styleEntry === 'undefined')
        await this.geoService.createStyle(`${layerName}_style`);
      this.logger.warn(
        'Estilo de capa en blanco, actualizando por valor configurado',
      );
      // Se actualiza la capa con los datos por defecto
      await this.geoService.uploadStyle(capa.style, `${layerName}_style`);
    }

    await this.updateStyleWithSLD(zipBody, layerName, style, workspace);

    this.logger.log(`Finalizado e importado shaperHandler para '${fileName}'.`);

    return 'done';
  }

  async shapeHandlerPS({
    workspace,
    datastore,
    layerName,
    style,
    path,
    fileName,
    timeDimension,
  }: MessageIDE) {
    this.logger.log(
      `Iniciando shaperHandler para '${layerName}' con archivo '${fileName}'`,
    );

    if (!timeDimension) {
      this.logger.error(
        'Finalizando shaperHandlerPs: no definida variable temporal',
      );
      return;
    }

    if (!fileName) {
      this.logger.error(`Finalizando shaperHandlerPS: archivo no indicado`);
      return;
    }

    const zipBody = await this.helperService.downloadFileS3(
      `${path}/${fileName}`,
    );

    if (!zipBody) {
      this.logger.error(
        `Archivo '${fileName}' no encontrado en S3. Finalizando`,
      );
      return;
    }

    const { capa, inputsGeom } = await this.helperService.getGeometriasAndCapa(
      zipBody,
      layerName,
      capasProductosSatelitales,
    );

    if (!capa || !inputsGeom) {
      this.logger.log(`Finalizado sin importar capa: '${fileName}'`);
      return 'done';
    }

    if (!(await this.geoService.checkDSPostgis(workspace, datastore))) {
      this.logger.error(`No es posible usar ${workspace}:${datastore}`);
      return;
    }

    const reformInputsGeom = inputsGeom.map((el: any) => {
      el.fecha = numberToDate(el.fecha);
      el.proc = numberToDate(el.proc);
      return el;
    });

    await this.helperService.deleteOldAndSaveNewGeometrias(
      capa,
      reformInputsGeom,
    );

    const layername = await this.geoService.getLayerName(
      layerName,
      workspace,
      datastore,
    );

    if (!layername)
      await this.geoService.publishLayer(
        layerName,
        workspace,
        datastore,
        [KEYWORDS.PRODUCTOS_SATELITALES],
        timeDimension,
      );

    const styleEntry = await this.geoService.getStyle(`${layerName}_style`);

    if (!styleEntry) {
      if (typeof styleEntry === 'undefined')
        await this.geoService.createStyle(`${layerName}_style`);
      this.logger.warn(
        'Estilo de capa en blanco, actualizando por valor configurado',
      );
      await this.geoService.uploadStyle(capa.style, `${layerName}_style`);
    }

    await this.updateStyleWithSLD(zipBody, layerName, style, workspace);

    this.logger.log(`Finalizado e importado shaperHandler para '${fileName}'.`);

    return 'done';
  }

  async shapeHandlerCA({ workspace, datastore, path, fileName }: MessageIDE) {
    this.logger.log(`Iniciando shaperHandlerCA con archivo '${fileName}'`);

    if (!fileName) {
      this.logger.error(`Finalizando shaperHandlerPS: archivo no indicado`);
      return;
    }

    const zipBody = await this.helperService.downloadFileS3(
      `${path}/${fileName}`,
    );

    const names: string[] = [];
    const zip = new AdmZip(zipBody);
    zip.forEach((entry) => names.push(entry.entryName.slice(0, -4)));

    const uniqueNames = [...new Set(names)];

    const exist = this.checkIfTableExist(
      [...capasCatastroMinero, ...capasProductosSatelitales],
      uniqueNames,
    );

    if (exist) {
      this.logger.error(
        `Una de las tablas a subir ya existe en los demás catálogos, abortando`,
      );
      return;
    }

    const deletedTables = await this.helperService.deleteTablesFromPostigs(
      uniqueNames,
    );

    if (!deletedTables) {
      this.logger.error('No se pudieron eliminar tablas, abortando');
      return;
    }

    const created = await this.geoService.checkDSAndPublishLayer(
      zipBody,
      uniqueNames,
      workspace,
      datastore,
    );

    if (created !== 201) {
      this.logger.error(
        'No es posible publicar capa(s). Consulte con el administrador',
      );
      return;
    }

    const fts = await this.geoService.updateFeatureTypesWithKeyword(
      workspace,
      datastore,
      uniqueNames,
    );

    if (fts && fts.length === 0) {
      this.logger.error('Capas no pudieron actualizarse');
      return;
    }

    this.logger.log('Finalizado y subidos con éxito');
    return;
  }

  // RECURSOS PRIVADOS
  private async updateStyleWithSLD(
    zipBody: Buffer,
    layerName: string,
    style: string,
    workspace: string,
  ) {
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
        // En caso de existir archivo .sld y este ser de formato XML, es actualizada el estilo con la data proveniente del archivo
        await this.geoService.uploadStyle(stypeString, `${layerName}_style`);
      }
    } else {
      this.logger.warn('Archivo de estilos .sld NO encontrado');
    }

    // Apply Style
    const styleName = style ? style : `${layerName}_style`;
    await this.geoService.setLayerStyle(layerName, styleName, workspace);
  }

  private checkIfTableExist(capas: Capa[], uniqueNames: string[]) {
    let result = false;
    const tablesName = capas.map((capa) => capa.tabla);
    for (let i = 0; i < uniqueNames.length; i++) {
      const name = uniqueNames[i].toLowerCase();
      if (tablesName.includes(name)) {
        result = true;
        break;
      }
    }
    return result;
  }
}
