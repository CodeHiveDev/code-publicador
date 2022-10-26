import { Module } from '@nestjs/common';
import { MessageService } from './services/message.service';
import { SqsModule } from '@ssut/nestjs-sqs';
import { SqsConfigService } from '../../helper/sqsConfig.service';
import { RasterModule } from '@modules/raster/raster.module';
import { ShaperModule } from '@modules/shaper/shaper.module';

@Module({
  imports: [
    SqsModule.registerAsync({
      useClass: SqsConfigService,
    }),
    ShaperModule,
    RasterModule,
  ],
  providers: [MessageService],
})
export class MessageModule {}
