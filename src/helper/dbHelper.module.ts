import { Module } from '@nestjs/common';
import { dbHelper } from './dbHelper';

@Module({
  providers: [dbHelper],
  exports: [dbHelper],
})
export class dbHelperModule {}
