import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { exec } from 'shelljs';
import axios from 'axios';
import { Helper } from 'src/helper/Helper';
import { GeoserverService } from '@services/geoserver.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
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

  }


  public async rasterHandler(fileraster: any, pathraster, folder,store, nameraster, type) {
    

    await fs.rmSync("./tmp", { recursive: true, force: true });
    
    const items = await this.HelperQ.s3downloadRaster(type, folder);

    // items.forEach((element) => {
     
    //   const name = element.Key.split('/')[2];
    //   console.log(name);

    // });

    const fileZip = await this.HelperQ.createZipArchive();

    await this.GeoService.uploadRaster(fileZip, type, store);

    //await this.GeoService.updateRaster(`file:///var/geoserver/datadir/data/${this.WORKSPACE}/${store}`,store)
    //await this.GeoService.updateRaster(`file:///var/local/geoserver/data/${this.WORKSPACE}/${this.STORE}`)


    items.forEach(async (element) => {

      const name = element.Key.split('/')[2];
      console.log(name);
      await this.GeoService.updateRaster2(`file:///var/geoserver/datadir/data/${this.WORKSPACE}/${store}/e${name}`,store)

    });

    //await this.GeoService.setConfigRaster(store)


  }
}
