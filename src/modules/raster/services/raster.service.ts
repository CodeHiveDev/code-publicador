import { Injectable } from '@nestjs/common';
import { HelperService } from 'src/helper/helper.service';
import { GeoserverService } from '@services/geoserver.service';
import * as fs from 'fs';
import { AppConfigService } from 'src/config/config.service';
@Injectable()
export class RasterService {
  private G_HOST: string;
  private WORKSPACE: string;
  private STORE: string;
  constructor(
    // TODO: eliminado forwardRef
    private appConfigService: AppConfigService,
    private geoService: GeoserverService,
    private helperService: HelperService,
  ) {
    this.G_HOST = this.appConfigService.serverHost;
    this.WORKSPACE = this.appConfigService.workspace;
  }

  public async rasterHandler(
    fileraster: any,
    pathraster,
    folder,
    store,
    nameraster,
    type,
  ) {
    await fs.rmSync('./tmp', { recursive: true, force: true });

    const items = await this.helperService.s3downloadRaster(type, folder);

    // items.forEach((element) => {

    //   const name = element.Key.split('/')[2];
    //   console.log(name);

    // });

    const fileZip = await this.helperService.createZipArchive();

    await this.geoService.uploadRaster(fileZip, type, store);

    await this.geoService.updateRaster(
      `file:///var/geoserver/datadir/data/${this.WORKSPACE}/${store}`,
      store,
    );
    //await this.GeoService.updateRaster(`file:///var/local/geoserver/data/${this.WORKSPACE}/${this.STORE}`)

    await this.geoService.setConfigRaster(store);
  }
}
