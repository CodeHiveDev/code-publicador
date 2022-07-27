import { Injectable } from '@nestjs/common';
const shell = require('shelljs');

@Injectable()
export class RasterService {
    public rasterHandler(fileraster: any) {
        console.log("the raster", fileraster)
        //shell.exec('raster2pgsql -s 4326 -I -C -M ' + fileraster + ' -F -t 100x100 public.rasters | psql -h 172.24.162.40 -d georaster -p 5436 -U postgres ');
        return "done"
    }
}
