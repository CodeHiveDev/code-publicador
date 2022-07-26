import { Injectable } from '@nestjs/common';
const shell = require('shelljs');



//import { raster } from "./raster.entity";

@Injectable()
export class RasterService {
    //constructor(@InjectConnection() private readonly connection: Connection) { }
    async rasterHandler() {
        shell.rm('raster2pgsql');
        //return this.connection.query("INSERT INTO rasters  VALUES (st_raster('C:\patagonian\raster.tif','compression=lz77))");
        //raster2pgsql -s 4326 -C -l 2,4 -I -F -t 2700x2700 gray_50m_sr_ob.tif data_import.gray_50m_sr_ob | psql -h localhost -p 5434 -U postgres -d mastering_postgis
    }
}
