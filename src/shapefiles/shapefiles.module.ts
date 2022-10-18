import { Module } from '@nestjs/common';
import { ShapefilesService } from './shapefiles.service';
import { dbHelper } from '../helper/dbHelper';

@Module({
  providers: [ShapefilesService, dbHelper],
  exports: [ShapefilesService],
})
export class ShapefilesModule {}
