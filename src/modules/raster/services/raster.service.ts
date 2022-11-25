import { Injectable } from '@nestjs/common';
import { HelperService } from 'src/helper/helper.service';
import { GeoserverService } from '@services/geoserver.service';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class RasterService {
  private G_HOST: string;
  private WORKSPACE: string;
  private STORE: string;
  constructor(
    // TODO: eliminado forwardRef
    private appConfigService: AppConfigService,
    private GeoService: GeoserverService,
    private helperService: HelperService,
  ) {
    this.G_HOST = this.appConfigService.serverHost;
    this.WORKSPACE = this.appConfigService.workspace;
    this.STORE = this.appConfigService.store;
  }

  public async rasterHandler(
    fileraster: any,
    pathraster,
    folder,
    nameraster,
    type,
  ) {
    //console.log("the raster", fileraster)
    console.log('the raster', folder);

    const items = await this.helperService.s3downloadRaster(type, folder);

    // items.forEach((element) => {

    //   const name = element.Key.split('/')[2];
    //   console.log(name);

    // });

    const fileZip = await this.helperService.createZipArchive();

    await this.GeoService.uploadRaster(fileZip, type);

    await this.GeoService.updateRaster(
      `file:///var/geoserver/datadir/data/${this.WORKSPACE}/${this.STORE}`,
    );

    //await this.GeoService.setConfigRaster()
  }
}
