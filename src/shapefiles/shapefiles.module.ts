import { Module } from '@nestjs/common';
import { ShapefilesService } from './shapefiles.service';

@Module({
  providers: [ShapefilesService],
  exports: [ShapefilesService],
})
export class ShapefilesModule {}
