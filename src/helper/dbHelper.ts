import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { exec } from 'shelljs';
import * as AWS from 'aws-sdk';
import * as path from 'path';

import { mkdirSync, createWriteStream } from 'fs';
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
    exec(
      'shp2pgsql -a -s 4326 -I -W "latin1" /tmp/' +
        pathandfile +
        ' public.shapefiles | PGAPPNAME="' +
        nameshapefile +
        '" PGPASSWORD=' +
        process.env.PGPASSWORD +
        ' psql -h ' +
        process.env.DATABASE_HOST +
        ' -d ' +
        process.env.POSTGRES_DB +
        ' -p ' +
        process.env.POSTGRES_PORT +
        ' -U ' +
        process.env.POSTGRES_USER +
        ' ',
    );
  }
  public async copyS3Tmp(nameshapefile: string, folders: string) {
    console.log('copyS3TmpcopyS3Tmp');
    const BUCKETNAME = this.configService.get<string>('BUCKETNAME');
    const S3 = this.s3;
    const options = {
      Bucket: `${BUCKETNAME}`,
      Prefix: `${folders}`,
    };

    await S3.listObjectsV2(options, function (err, data) {
      if (err) {
        console.log('err', err);
      } else {
        const items = data['Contents'].filter((item) =>
          item.Key.includes(`${nameshapefile}.`),
        );

        mkdirSync(`/tmp/${folders}/`, { recursive: true });
        items.forEach(async function (obj) {
          const name = obj.Key;
          console.log(name);
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
    console.log('copyS3TmpcopyS3Tmp');
  }
}
