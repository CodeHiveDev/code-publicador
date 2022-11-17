import { Module } from '@nestjs/common';
import { ShaperService } from './services/shaper.service';
import { Helper } from '../../helper/Helper';
import { GeoserverService } from '@services/geoserver.service';
import { HttpConfigService } from '@services/httpService.config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
  providers: [ShaperService, Helper, GeoserverService],
  exports: [ShaperService],
})
export class ShaperModule {}
