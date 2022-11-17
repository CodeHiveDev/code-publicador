import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { exec } from 'shelljs';
import axios from 'axios';
import { Helper } from 'src/helper/Helper';
import { GeoserverService } from '@services/geoserver.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RasterService {
  private G_HOST: string;
  private WORKSPACE:string;
  private STORE:string;
  constructor(
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
    private GeoService: GeoserverService,
    private HelperQ: Helper,
    
  ) {
    this.G_HOST = this.configService.get<string>('SERVER_HOST');
    this.WORKSPACE = this.configService.get<string>('WORKSPACE');
    this.STORE = this.configService.get<string>('STORE');

  }


  public async rasterHandler(fileraster: any, pathraster, folder, nameraster, type) {
    //console.log("the raster", fileraster)
    console.log('the raster', folder);

    const items = await this.HelperQ.s3downloadRaster(type, folder);

    // items.forEach((element) => {
     
    //   const name = element.Key.split('/')[2];
    //   console.log(name);

    // });

    const fileZip = await this.HelperQ.createZipArchive();

    await this.GeoService.uploadRaster(fileZip, type);

    await this.GeoService.updateRaster(`file:///var/geoserver/datadir/data/${this.WORKSPACE}/${this.STORE}`)

    //await this.GeoService.setConfigRaster()


  }
}
