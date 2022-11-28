import { Module } from '@nestjs/common';
import { ShaperService } from './services/shaper.service';
import { HelperService } from '../../helper/helper.service';
import { GeoserverService } from '@services/geoserver.service';
import { HttpConfigService } from '@services/httpService.config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
  providers: [ShaperService, HelperService, GeoserverService],
  exports: [ShaperService],
})
export class ShaperModule {}
