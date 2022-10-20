import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as AWS from 'aws-sdk';
import * as path from 'path';

import { writeFile, writeFileSync, mkdirSync, createWriteStream} from 'fs';
interface DatabaseConfig {
  host: string;
  port: number;
}
@Injectable()
export class dbHelper {
  private s3: any;
  constructor(
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
    @InjectDataSource() private dataSource: DataSource,
  ) {
    AWS.config.update({
      accessKeyId: this.configService.get<string>('ACCESS_KEY_ID'), //config.ACCESS_KEY_ID,
      secretAccessKey: this.configService.get<string>('SECRET_ACCESS_KEY'), //config.SECRET_ACCESS_KEY,
      region: this.configService.get<string>('AWS_REGION'), //config.AWS_REGION,
    });
    this.s3 = new AWS.S3();
  }

  //Create table
  public async createTable(nameshapefile: string) {
    const query = await this.dataSource.query(
      `CREATE TABLE IF NOT EXISTS public.shapefiles ( idshapefile serial NOT NULL, id_0 integer NOT NULL, layername varchar(100), expediente text, categoria text, fecha date, geom geometry, PRIMARY KEY (idshapefile))`,
    );
    this.dataSource.query(
      `ALTER TABLE public.shapefiles ADD COLUMN IF NOT EXISTS layername varchar(100) DEFAULT ${nameshapefile}`,
    );
  }

  //Create table
  public async shapefilesUpdate(nameshapefile: string) {
    this.dataSource.query(
      `UPDATE public.shapefiles SET layername =  ${nameshapefile} WHERE layername IS NULL`,
    ); //AND fecha = atributo fecha
  }

  //Shapefile to Postgis
  public async shapefilesToPosg(pathandfile: string, nameshapefile: string) {
    this.dataSource.query(
      `shp2pgsql -a -s 4326 -I -W "latin1" /tmp/${pathandfile} public.shapefiles | PGAPPNAME=${nameshapefile} PGPASSWORD=${this.configService.get<string>(
        'DATABASE_PASSWORD',
      )} psql -h ${this.configService.get<string>(
        'DATABASE_HOST',
      )} -d ${this.configService.get<string>(
        'DATABASE_NAME',
      )} -p ${this.configService.get<string>(
        'DATABASE_PORT',
      )} -U ${this.configService.get<string>('DATABASE_USER')} `,
    ); //AND fecha = atributo fecha
  }
  public async copyS3Tmp(nameshapefile: string, folders: string) {
    const BUCKETNAME = this.configService.get<string>('BUCKETNAME');
    const S3 = this.s3;
    const options = {
      Bucket: `${BUCKETNAME}`,
      Prefix: `${folders}`,
    };
    S3.listObjectsV2(options, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        const items = data['Contents'].filter((item) =>
          item.Key.includes(`${nameshapefile}.`),
        );
        mkdirSync(`/tmp/${folders}/`, { recursive: true });
        items.forEach(async function (obj) {
          const name = obj.Key;
          const params = {
            Bucket: `${BUCKETNAME}`,
            Key: name,
          };
          const rs = S3.getObject(params).createReadStream();
          const ws = createWriteStream(
            path.join(`/tmp/${folders}/`, name.split('/')[2]),
          );

          rs.pipe(ws);
        });
      }
    });
  }
}
