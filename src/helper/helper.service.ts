import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'shelljs';
import * as AWS from 'aws-sdk';
import * as path from 'path';
import * as AdmZip from 'adm-zip';
import { mkdirSync, createWriteStream } from 'fs';
import { AppConfigService } from 'src/config/config.service';
import * as shp from 'shpjs';
import { capasCatastroMinero } from 'src/common/constants/capas-catastro-minero';
import { CapasCatastroMinero } from 'src/common/interfaces/capas-catastro-minero.interface';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HelperService {
  private s3: AWS.S3;
  private readonly logger = new Logger(HelperService.name);
  constructor(
    private appConfigService: AppConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.s3 = new AWS.S3();
  }

  //Create table
  public async createTable(nameshapefile: string) {
    exec(
      'PGPASSWORD=' +
        this.appConfigService.pgPassword +
        ' psql -h ' +
        this.appConfigService.postgresHost +
        ' -d ' +
        this.appConfigService.postgresDb +
        ' -p ' +
        this.appConfigService.postgresPort +
        ' -U ' +
        this.appConfigService.postgresUser +
        ' -c "CREATE TABLE IF NOT EXISTS public.shapefiles ( idshapefile serial NOT NULL, id_0 integer NOT NULL, layername varchar(100), expediente text, categoria text, fecha date, geom geometry, PRIMARY KEY (idshapefile))" ',
    ); // -f "createshapefile" sql query
    // Altern Table add column
    exec(
      'PGPASSWORD=' +
        this.appConfigService.pgPassword +
        ' psql -h ' +
        this.appConfigService.postgresHost +
        ' -d ' +
        this.appConfigService.postgresDb +
        ' -p ' +
        this.appConfigService.postgresPort +
        ' -U ' +
        this.appConfigService.postgresUser +
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
        this.appConfigService.pgPassword +
        ' psql -h ' +
        this.appConfigService.postgresHost +
        ' -d ' +
        this.appConfigService.postgresDb +
        ' -p ' +
        this.appConfigService.postgresPort +
        ' -U ' +
        this.appConfigService.postgresUser +
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
        this.appConfigService.pgPassword +
        ' psql -h ' +
        this.appConfigService.postgresHost +
        ' -d ' +
        this.appConfigService.postgresDb +
        ' -p ' +
        this.appConfigService.postgresPort +
        ' -U ' +
        this.appConfigService.postgresUser +
        ' ',
    );
  }
  public async copyS3execTmp(nameshapefile: string, folders: string) {
    const BUCKETNAME = this.appConfigService.bucketName;
    exec(
      `aws s3 cp s3://${BUCKETNAME}/${folders} /tmp/${folders} --recursive --exclude "*" --include "${nameshapefile}*" --profile invap`,
    );
  }

  public async downloadFileS3(fullnameShapefile: string): Promise<Buffer> {
    const BUCKETNAME = this.appConfigService.bucketName;
    const S3 = this.s3;

    const bucketParams = {
      Bucket: BUCKETNAME,
      Key: fullnameShapefile,
    };

    try {
      const zipFile = await S3.getObject(bucketParams).promise();
      const zipBody = zipFile.Body;

      if (!Buffer.isBuffer(zipBody)) {
        this.logger.error('Not a buffer');
        return;
      }
      return zipBody;
    } catch (error) {
      this.logger.error(`- Error downloadFileS3 - ${error}`);
      return;
    }
  }

  public async getGeometriasAndCapa(zipBody: Buffer, nameshapefile: string) {
    const geojsonfile = await shp(zipBody);

    if (Array.isArray(geojsonfile)) {
      this.logger.error(
        `Error al intentar abrir el archivo ${nameshapefile} (zip)`,
      );
      return {};
    } else {
      const geojsons = geojsonfile.features;

      const capa = capasCatastroMinero.find(
        (el) => el.tabla === nameshapefile.toLowerCase(),
      );

      if (!capa) {
        this.logger.error(`Capa ${nameshapefile} no configurada`);
        return {};
      } else {
        const inputsGeom = geojsons.map((geometry) => {
          const input = {};
          input[capa.geometria.db] = geometry[capa.geometria.shapefile];
          capa.propiedades.forEach((prop) => {
            input[prop.db] = Number.isNaN(geometry.properties[prop.shapefile])
              ? null
              : geometry.properties[prop.shapefile];
          });
          return input;
        });

        return { capa, inputsGeom };
      }
    }
  }

  public async deleteOldAndSaveNewGeometrias(
    capa: CapasCatastroMinero,
    inputsGeom: Record<string, any>[],
  ) {
    try {
      const { inserted, deleted } = await this.dataSource.transaction(
        async (transanctionManager) => {
          const deleted = await transanctionManager.delete(capa.tabla, {});

          const results = await transanctionManager
            .createQueryBuilder()
            .insert()
            .into(capa.tabla, [
              capa.geometria.db,
              ...capa.propiedades.map((prop) => prop.db),
            ])
            .values(inputsGeom)
            .returning(capa.retorna)
            .execute();

          return { inserted: results.raw.length, deleted: deleted.affected };
        },
      );
      this.logger.log(
        `Elimnados ${deleted} filas e insertadas ${inserted} filas`,
      );
      return { inserted, deleted };
    } catch (error) {
      this.logger.error(`- Error deleteOldAndSaveNewGeometrias - ${error}`);
    }
  }

  public async s3downloadRaster(folders: string) {
    const BUCKETNAME = this.appConfigService.bucketName;
    const S3 = this.s3;
    let itemsR;
    await new Promise((resolve) => {
      const options = {
        Bucket: `${BUCKETNAME}`,
        Prefix: `${folders}`,
      };
      S3.listObjectsV2(options)
        .promise()
        .then((obj) => {
          itemsR = obj['Contents'];
          mkdirSync(`./tmp/${folders}/`, { recursive: true, mode: 777 });
          itemsR.forEach((element) => {
            const name = element.Key;
            console.log('Descargando... ', name);
            const params = {
              Bucket: `${BUCKETNAME}`,
              Key: name,
            };
            if (name.split('/')[2] != '') {
              S3.getObject(params)
                .createReadStream()
                .pipe(
                  createWriteStream(
                    path.join(`./tmp/${folders}/`, `e${name.split('/')[2]}`),
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
    const BUCKETNAME = this.appConfigService.bucketName;
    const S3 = this.s3;
    const options = {
      Bucket: `${BUCKETNAME}`,
      Prefix: `${folders}`,
    };

    S3.listObjectsV2(options, function (err, data) {
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

          return new Promise((resolve) => {
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
      const zip = new AdmZip();
      const outputFile = './tmp/publicador/rasters/rasters.zip';
      zip.addLocalFolder('./tmp/publicador/rasters');
      zip.writeZip(outputFile);
      console.log(`Created ${outputFile} successfully`);
      return outputFile;
    } catch (e) {
      console.log(`Something went wrong. ${e}`);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
