import { Module } from '@nestjs/common';
import { RasterService } from './services/raster.service';

@Module({
  providers: [RasterService],
  exports: [RasterService],
})
export class RasterModule {}
