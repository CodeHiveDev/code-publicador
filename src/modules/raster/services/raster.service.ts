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

    const fileZip = await this.helperService.createZipArchive();

    await this.geoService.uploadRaster(fileZip, datastore);

    await this.geoService.updateRaster(`file:///var/geoserver/datadir/data/${this.WORKSPACE}/${datastore}`,datastore);

    await this.geoService.setConfigRaster(datastore);

    
  }
}
