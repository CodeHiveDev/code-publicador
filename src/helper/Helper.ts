import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { exec } from 'shelljs';
import * as AWS from 'aws-sdk';
import * as path from 'path';
import * as AdmZip from 'adm-zip';
import { mkdirSync, createWriteStream } from 'fs';
interface DatabaseConfig {
  host: string;
  port: number;
}
@Injectable()
export class Helper {
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
    exec(
      'PGPASSWORD=' +
        process.env.PGPASSWORD +
        ' psql -h ' +
        process.env.DATABASE_HOST +
        ' -d ' +
        process.env.POSTGRES_DB +
        ' -p ' +
        process.env.POSTGRES_PORT +
        ' -U ' +
        process.env.POSTGRES_USER +
        ' -c "CREATE TABLE IF NOT EXISTS public.shapefiles ( idshapefile serial NOT NULL, id_0 integer NOT NULL, layername varchar(100), expediente text, categoria text, fecha date, geom geometry, PRIMARY KEY (idshapefile))" ',
    ); // -f "createshapefile" sql query
    // Altern Table add column
    exec(
      'PGPASSWORD=' +
        process.env.PGPASSWORD +
        ' psql -h ' +
        process.env.DATABASE_HOST +
        ' -d ' +
        process.env.POSTGRES_DB +
        ' -p ' +
        process.env.POSTGRES_PORT +
        ' -U ' +
        process.env.POSTGRES_USER +
        ' -c "ALTER TABLE public.shapefiles ADD COLUMN IF NOT EXISTS layername varchar(100) DEFAULT ' +
        nameshapefile +
        ' " ',
    );
  }

  //Create table
  public async shapefilesUpdate(nameshapefile: string) {
    // Insert field layername if is null
    exec(
      'PGPASSWORD=' +
        process.env.PGPASSWORD +
        ' psql -h ' +
        process.env.DATABASE_HOST +
        ' -d ' +
        process.env.POSTGRES_DB +
        ' -p ' +
        process.env.POSTGRES_PORT +
        ' -U ' +
        process.env.POSTGRES_USER +
        ' -c "UPDATE public.shapefiles SET layername = ' +
        "'" +
        nameshapefile +
        "'" +
        ' WHERE layername IS NULL" ',
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
  public async copyS3execTmp(nameshapefile: string, folders: string) {
    const BUCKETNAME = this.configService.get<string>('BUCKETNAME');
    exec(
      `aws s3 cp s3://${BUCKETNAME}/${folders} /tmp/${folders} --recursive --exclude "*" --include "${nameshapefile}*" --profile invap`,
    );
  }

  public async s3download(nameshapefile: string, folders: string) {
    const BUCKETNAME = this.configService.get<string>('BUCKETNAME');
    const S3 = this.s3;
    return new Promise((resolve, reject) => {
      const options = {
        Bucket: `${BUCKETNAME}`,
        Prefix: `${folders}`,
      };
      S3.listObjectsV2(options)
        .promise()
        .then((obj) => {
          const items = obj['Contents'].filter((item) =>
            item.Key.includes(`${nameshapefile}.`),
          );
          mkdirSync(`/tmp/${folders}/`, { recursive: true });
          items.forEach((element) => {
            const name = element.Key;
            console.log('Descargando... ', name);
            const params = {
              Bucket: `${BUCKETNAME}`,
              Key: name,
            };

            S3.getObject(params)
              .createReadStream()
              .pipe(
                createWriteStream(
                  path.join(`/tmp/${folders}/`, name.split('/')[2]),
                ),
              )
              .on('close', () => {
                resolve(path.join(`/tmp/${folders}/`, name.split('/')[2]));
              });
          });
       
        });
    });
  }
  public async s3downloadRaster(type: string, folders: string) {
    const BUCKETNAME = this.configService.get<string>('BUCKETNAME');
    const S3 = this.s3;
    let itemsR;
    await new Promise((resolve, reject) => {
      const options = {
        Bucket: `${BUCKETNAME}`,
        Prefix: `${folders}`,
      };
      S3.listObjectsV2(options)
        .promise()
        .then((obj) => {
          itemsR = obj['Contents'];
          mkdirSync(`./tmp/${folders}/`, { recursive: true, mode:777 });
          itemsR.forEach((element) => {
            const name = element.Key;
            console.log('Descargando... ', name);
            const params = {
              Bucket: `${BUCKETNAME}`,
              Key: name,
            };
            if(name.split('/')[2]!=""){
              S3.getObject(params)
              .createReadStream()
              .pipe(
                createWriteStream(
                  path.join(`./tmp/${folders}/`, `e${name.split('/')[2]}`)
                ),
              )
              .on('close', () => {
                resolve(true);
              });
            }

          });
       
          //return itemsR;
        });
    });
    return itemsR;
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
        items.forEach((obj) => {
          const name = obj.Key;
          console.log('Descargando... ', name);
          const params = {
            Bucket: `${BUCKETNAME}`,
            Key: name,
          };

          return new Promise((resolve, reject) => {
            S3.getObject(params)
              .createReadStream()
              .pipe(
                createWriteStream(
                  path.join(`/tmp/${folders}/`, name.split('/')[2]),
                ),
              )
              .on('close', () => {
                resolve(path.join(`/tmp/${folders}/`, name.split('/')[2]));
              });
          });
        });
      }
    });
  }

  public async createZipArchive() {
    try {
      for (let i = 0; i < 2; i++) {
        console.log(`Waiting ${i} seconds... / CreateZipArchive`);
        await sleep(i * 10000);
    }
      const zip =  new AdmZip();
      const outputFile = "./tmp/publicador/rasters/rasters.zip";
      zip.addLocalFolder("./tmp/publicador/rasters");
      zip.writeZip(outputFile);
      console.log(`Created ${outputFile} successfully`);
      return outputFile;
    } catch (e) {
      console.log(`Something went wrong. ${e}`);
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}