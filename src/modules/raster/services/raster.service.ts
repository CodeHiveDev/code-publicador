import { Injectable } from '@nestjs/common';
import { exec } from 'shelljs';
import axios from 'axios';

@Injectable()
export class RasterService {
  public rasterHandler(fileraster: any, pathraster, folder, nameraster, type) {
    //console.log("the raster", fileraster)
    console.log('the raster', pathraster);
    exec(
      'aws s3 cp s3://ho-backend-content-dev/' +
        pathraster +
        ' /mnt/d/tmp/publicador',
    );
    exec(
      'raster2pgsql -s 4326 -a -I -C -M /mnt/d/tmp/' +
        pathraster +
        ' -F -t 256x256 public.rasters | PGPASSWORD=postgres psql -h 172.17.26.18 -d georaster -p 5436 -U postgres ',
    );
    return 'done';
  }
}
