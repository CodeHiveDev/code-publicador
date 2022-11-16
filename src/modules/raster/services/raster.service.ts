import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { exec } from 'shelljs';
import axios from 'axios';
import { dbHelper } from 'src/helper/dbHelper';
import { GeoserverService } from '@services/geoserver.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RasterService {
  private G_HOST: string;
  constructor(
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
    private GeoService: GeoserverService,
    private dbHelperQ: dbHelper,
  ) {
    this.G_HOST = this.configService.get<string>('SERVER_HOST');

  }


  public async rasterHandler(fileraster: any, pathraster, folder, nameraster, type) {
    //console.log("the raster", fileraster)
    console.log('the raster', folder);

    const items = await this.dbHelperQ.s3downloadRaster(type, folder);

    // items.forEach((element) => {
     
    //   const name = element.Key.split('/')[2];
    //   console.log(name);

    // });

    const fileZip = await this.dbHelperQ.createZipArchive();

    await this.GeoService.uploadRaster(fileZip, type);

    await this.GeoService.updateRaster("file:///var/local/geoserver/data/invap/canteras")

    //await this.GeoService.setConfigRaster()


  }
}
