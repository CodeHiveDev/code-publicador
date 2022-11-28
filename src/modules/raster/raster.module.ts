import { Module } from '@nestjs/common';
import { GeoserverService } from '@services/geoserver.service';
import { HelperService } from 'src/helper/helper.service';
import { RasterService } from './services/raster.service';
import { HttpModule } from '@nestjs/axios';
import { HttpConfigService } from '@services/httpService.config';

@Module({
  imports: [
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
  providers: [RasterService, HelperService, GeoserverService],
  exports: [RasterService],
})
export class RasterModule {}
