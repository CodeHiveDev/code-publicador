import { Injectable, Logger } from '@nestjs/common';
import { HelperService } from 'src/helper/helper.service';
import { GeoserverService } from '@services/geoserver.service';
import * as fs from 'fs';
import { AppConfigService } from 'src/config/config.service';
@Injectable()
export class RasterService {
  private G_HOST: string;
  private WORKSPACE: string;
  private STORE: string;
  private readonly logger = new Logger(RasterService.name);
  constructor(
    // TODO: eliminado forwardRef
    private appConfigService: AppConfigService,
    private geoService: GeoserverService,
    private helperService: HelperService,
  ) {
    this.G_HOST = this.appConfigService.serverHost;
    this.WORKSPACE = this.appConfigService.workspaceRaster;
  }

  public async rasterHandler(folder, datastore) {
    this.logger.log(
      `Iniciando rasterHandler para '${datastore}`,
    );

    await fs.rmSync('./tmp', { recursive: true, force: true });

    const items = await this.helperService.s3downloadRaster(folder);


    const arregloDeArreglos = []; // Aquí almacenamos los nuevos arreglos
    console.log("Arreglo original: ", items);
    const LONGITUD_PEDAZOS = 100; // Partir en arreglo de 100
    for (let i = 0; i < items.length; i += LONGITUD_PEDAZOS) {
      let pedazo = items.slice(i, i + LONGITUD_PEDAZOS);
      arregloDeArreglos.push(pedazo);
    }
    console.log("Arreglo de arreglos: ", arregloDeArreglos);


    for(let elem of arregloDeArreglos) {
      try {

        const fileZip = await this.helperService.createZipArchiveBatch(elem);

        await this.geoService.uploadRaster(fileZip, datastore);

      } catch (error) {
        console.log('arregloDeArreglos'+ error);
      }
    }

<<<<<<< HEAD
    await items.forEach(async (element) => {
=======
>>>>>>> main

    for(let element of items) {
      try {

        const name = element.Key.split('/')[2];
        console.log(name);
        await this.geoService.updateRaster2(`file:///var/geoserver/datadir/data/${this.WORKSPACE}/${datastore}/e${name}`,datastore)
  

      } catch (error) {
        console.log('for updateRaster2'+ error);
      }
    }




    //await this.geoService.updateRaster(`file:///var/geoserver/datadir/data/${this.WORKSPACE}/${datastore}`, datastore);

    await this.geoService.setConfigRaster(datastore);


  }
}

