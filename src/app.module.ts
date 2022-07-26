import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MensajeModule } from './module/awsmessage/mensaje.module';
import { ConfigModule } from '@nestjs/config';
//import { getEnvPath } from './common/helper/env.helper';
import { RasterModule } from './raster/raster.module';

//const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
  imports: [MensajeModule, 
     ConfigModule.forRoot(), RasterModule
   // ConfigModule.forRoot({ envFilePath: `${process.env.NODE_ENV}.env`, isGlobal: true })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
