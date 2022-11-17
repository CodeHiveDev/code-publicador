import { Module } from '@nestjs/common';
import { GeoserverService } from '@services/geoserver.service';
import { Helper } from 'src/helper/Helper';
import { RasterService } from './services/raster.service';
import { HttpModule } from '@nestjs/axios';
import { HttpConfigService } from '@services/httpService.config';

@Module({
  imports: [
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
  providers: [RasterService, Helper, GeoserverService],
  exports: [RasterService],
})
export class RasterModule {}
