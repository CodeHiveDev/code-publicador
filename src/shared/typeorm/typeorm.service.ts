import { Injectable, Inject } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  @Inject(AppConfigService)
  private readonly appConfigService: AppConfigService;

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.appConfigService.postgresHost,
      port: this.appConfigService.postgresPort,
      database: this.appConfigService.postgresDb,
      username: this.appConfigService.postgresUser,
      password: this.appConfigService.pgPassword,
      //entities: ['dist/**/*.entity.{ts,js}'],
      //migrations: ['{dist,src}/migrations/*.{ts,js}'],
      //migrationsTableName: 'typeorm_migrations',
      logger: 'file',
      synchronize: false, // never use TRUE in production!
    };
  }
}
