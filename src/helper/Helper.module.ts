import { Module } from '@nestjs/common';
import { Helper } from './Helper';

@Module({
  providers: [Helper],
  exports: [Helper],
})
export class HelperModule {}
