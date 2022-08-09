import { Module } from '@nestjs/common';
import { RasterController } from './raster.controller';
import { RasterService } from './raster.service';

@Module({
  controllers: [RasterController],
  providers: [RasterService],
  exports: [RasterService],
})
export class RasterModule {}
