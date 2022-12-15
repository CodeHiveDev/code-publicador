import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from '@modules/message/message.module';
import { RasterModule } from '@modules/raster/raster.module';
import { ShaperModule } from '@modules/shaper/shaper.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './shared/typeorm/typeorm.service';
import { HelperModule } from './helper/Helper.module';
import { HttpModule } from '@nestjs/axios';
import { HttpConfigService } from '@services/httpService.config';
import { GeoserverService } from '@services/geoserver.service';
import { AppConfigModule } from './config/config.module';

@Module({
  imports: [
    AppConfigModule,
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
    HelperModule,
    RasterModule,
    ShaperModule,
    MessageModule,
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
  ],
  controllers: [AppController],
  providers: [AppService, GeoserverService],
})
export class AppModule {}
