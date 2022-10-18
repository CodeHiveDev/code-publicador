import { Injectable, forwardRef, Inject, ConsoleLogger } from '@nestjs/common';
import { exec } from 'shelljs';
import axios from 'axios';
import * as fs from 'fs';
import { readFileSync } from 'fs';
import { ConfigService } from '@nestjs/config';
import path = require('path');
import { dbHelper } from '../helper/dbHelper';
@Injectable()
export class ShapefilesService {
  private P_PORT: number;
  private P_HOST: string;
  private P_USER: string;
  private P_DB: string;
  private P_PASS: string;
  private G_HOST: string;
  private G_AUTH: string;
  private G_USER: string;
  private G_PASS: string;
  private PBUCKETNAME: string;
  constructor(
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
    private dbHelperQ: dbHelper,
  ) {
    this.G_HOST = this.configService.get<string>('SERVER_HOST');

    if (!this.G_HOST) {
      throw new Error(`GEOSERVER variables are missing`);
    }

    const BUCKETNAME = this.configService.get<string>('BUCKETNAME');
    this.PBUCKETNAME = BUCKETNAME;

    const GEOSERVER_AUTH = this.configService.get<string>(
      'geoserverService.SERVER_AUTH',
    );
    this.G_AUTH = GEOSERVER_AUTH;

    const GEOSERVER_USER = this.configService.get<string>(
      'geoserverService.SERVER_USER',
    );
    this.G_USER = GEOSERVER_USER;

    const GEOSERVER_PASS = this.configService.get<string>(
      'geoserverService.SERVER_PASSWORD',
    );
    this.G_PASS = GEOSERVER_PASS;

    const POSTGRES_HOST = this.configService.get<string>('DATABASE_HOST');

    this.P_HOST = POSTGRES_HOST;

    const POSTGRES_PORT = this.configService.get<number>('DATABASE_PORT');
    this.P_PORT = POSTGRES_PORT;

    const POSTGRES_USER = this.configService.get<string>('DATABASE_USER');
    this.P_USER = POSTGRES_USER;

    const POSTGRES_DB = this.configService.get<string>('DATABASE_NAME');
    this.P_DB = POSTGRES_DB;

    const PGPASSWORD = this.configService.get<string>('DATABASE_PASSWORD');
    this.P_PASS = PGPASSWORD;
  }
  public shapeHandler(
    fileshape: any,
    pathandfile,
    folders3,
    nameshapefile,
    type,
  ) {
    // Copy S3 file to a temp storage
    exec(
      `aws s3 cp s3://${this.PBUCKETNAME}/${folders3} /tmp/${folders3} --recursive --exclude "*" --include ${nameshapefile}*`,
    );

    // Convert shp to postgis
    try {
      // Create table
      this.dbHelperQ.createTable(nameshapefile);

      // Check if exist the layer and then...
      this.getLayerName(nameshapefile)
        .then(async (res) => {
          // Shapefile to Postgis
          exec(
            `shp2pgsql -a -s 4326 -I -W "latin1" /tmp/${pathandfile} public.shapefiles | PGAPPNAME=${nameshapefile} PGPASSWORD=${this.P_PASS} psql -h ${this.P_HOST} -d ${this.P_DB} -p ${this.P_PORT} -U ${this.P_USER} `,
          );

          // Insert field layername if is null
          this.dbHelperQ.shapefilesUpdate(nameshapefile);

          // Geoserver Rest Publish
          await this.publishLayer(nameshapefile, type);
          // Get Style If exist
          this.getStyle('semaforo_style')
            .then(async (res) => {
              // Create Style
              await this.createStyle('semaforo_style')
                .then(async (res) => {
                  // UpLoad Style
                  // let sldfile = `/tmp/${folders3}${nameshapefile}.sld`;
                  let sldfile = path.join(
                    __dirname,
                    '..',
                    '/common/files/semaforo_style.sld',
                  );
                  this.uploadStyle(sldfile, 'semaforo_style');
                })
                .catch((error) => {
                  console.log(error);
                });
              // Apply Style
              await this.setLayerStyle(nameshapefile, 'semaforo_style');
            })
            .catch((error) => {
              // Apply Style
              this.setLayerStyle(nameshapefile, 'semaforo_style');
            });

          // Delete File s3 if ok
        })
        .catch((error) => {
          // nothing
        });
    } catch (err) {
      console.warn('err', err);
    }

    // Delete layer if need
    // DELETE http://<url>/geoserver/rest/workspaces/<workspaceName>/coveragestores/<storeName>/coverages/<layerName>?recurse=true
    return 'done';
  }

  private async getStyle(layername) {
    return new Promise((resolve, reject) => {
      let config = {
        method: 'get',
        url: `http://${this.G_HOST}/geoserver/rest/styles/${layername}.sld`,
        headers: {
          Authorization: `Basic ${this.G_AUTH}`,
          'Content-Type': 'application/xml',
        },
      };
      axios(config)
        .then((res) => {
          if (res.status == 200) {
            reject('err');
            console.warn('style exists');
          } else {
            resolve('no style');
          }
        })
        .catch((error) => {
          resolve('no style');
          console.log('error en el get style geoserver');
        });
    });
  }

  private async getLayerName(layername) {
    return new Promise(async (resolve, reject) => {
      let config = {
        method: 'get',
        url: `http://${this.G_HOST}/geoserver/rest/workspaces/Mineria/datastores/postgis/featuretypes/${layername}.xml`,
        headers: {
          Authorization: `Basic ${this.G_AUTH}`,
          'Content-Type': 'application/xml',
        },
      };
      const conn = await axios(config)
        .then((res) => {
          return res.status;
        })
        .catch((error) => {
          console.log('error en el get layer geoserver');
        });
      if (conn == 200 || conn == 201) {
        console.warn('layer exists');
        reject('layer exist');
      } else {
        resolve('no layer');
      }
    });
  }

  private async publishLayer(nameshapefile, type) {
    let func = 'publishLayer';
    let data = `<featureType>
                <name>${nameshapefile}</name>
                <nativeName>${nameshapefile}</nativeName>
                <namespace>
                    <name>Mineria</name>
                    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate" href="http://${this.G_HOST}/geoserver/rest/namespaces/Mineria.xml" type="application/xml"/>
                </namespace>
                <title>${nameshapefile}</title>
                <keywords>
                    <string>features</string>
                    <string>${nameshapefile}</string>
                </keywords>
                <srs>EPSG:4326</srs>
                <projectionPolicy>FORCE_DECLARED</projectionPolicy>
                <enabled>true</enabled>
                <metadata>
                    <entry key="cachingEnabled">false</entry>
                    <entry key="JDBC_VIRTUAL_TABLE">
                    <virtualTable>
                        <name>${nameshapefile}</name>
                        <sql>select idshapefile, id_0, layername, expediente, categoria, fecha, geom  from shapefiles where layername = '${nameshapefile}' order by idshapefile asc</sql>
                        <escapeSql>false</escapeSql>
                        <keyColumn>idshapefile</keyColumn>
                        <geometry>
                            <name>geom</name>
                            <type>${type}</type>
                            <srid>4326</srid>
                        </geometry>
                    </virtualTable>
                    </entry>
                    <entry key="time">
                        <dimensionInfo>
                            <enabled>true</enabled>
                            <attribute>fecha</attribute>
                            <presentation>CONTINUOUS_INTERVAL</presentation>
                            <units>ISO8601</units>
                            <defaultValue>
                                <strategy>MAXIMUM</strategy>
                            </defaultValue>
                        </dimensionInfo>
                    </entry>
                </metadata>
                <store class="dataStore">
                    <name>postgis</name>
                    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate" href="http://${this.G_HOST}/geoserver/rest/workspaces/Mineria/datastores/postgis.xml" type="application/xml"/>
                </store>
                <maxFeatures>0</maxFeatures>
                <numDecimals>0</numDecimals>
            </featureType>`;
    // Style layer
    // Post Config
    let url = `http://${this.G_HOST}/geoserver/rest/workspaces/Mineria/datastores/postgis/featuretypes`;
    let auth = `${this.G_AUTH}`;
    this.connection(data, 'post', url, auth, 'xml', func);
  }

  private async createStyle(layername) {
    return new Promise(async (resolve, reject) => {
      let func = 'createStyle';
      let dataStyle = `<style><name>${layername}</name><filename>${layername}.sld</filename></style>`;
      let url = `http://${this.G_HOST}/geoserver/rest/styles`;

      let config = {
        method: 'post',
        url: url,
        data: dataStyle,
        headers: {
          Authorization: `Basic ${this.G_AUTH}`,
          'Content-Type': 'application/xml',
        },
      };
      const conn = await axios(config)
        .then((res) => {
          return res.status;
        })
        .catch((error) => {
          console.log('error en el create style geoserver');
        });
      if (conn == 200 || conn == 201) {
        console.warn('style created');
        resolve('style created');
        return resolve;
      } else {
        reject('no connexion');
      }
    });
  }

  private uploadStyle(sldfile, layername) {
    let func = 'uploadStyle';
    let url = `http://${this.G_HOST}/geoserver/rest/styles/${layername}`; //?name=${layername}` ?raw=true
    let auth = `${this.G_AUTH}`;
    // this.connection(sldfile, 'put', url, auth, 'vnd.ogc.sld+xml', func)
    // alternative with curl
    exec(
      `curl -v -u ${this.G_USER}:${this.G_PASS} -XPUT -H "Content-type: application/vnd.ogc.sld+xml" -d @${sldfile} ${url}`,
    );
  }

  private setLayerStyle(layername, stylename) {
    let func = 'setLayerStyle';
    let dataStyle = `<layer><defaultStyle><name>${stylename}</name></defaultStyle></layer>`;
    let url = `http://${this.G_HOST}/geoserver/rest/layers/Mineria:${layername}`;
    let auth = `${this.G_AUTH}`;
    this.connection(dataStyle, 'put', url, auth, 'xml', func);
  }

  private async connection(dataIn, method, urlParams, auth, contentType, func) {
    let configConn = {
      method: method,
      url: urlParams,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': `application/${contentType}`,
      },
      data: dataIn,
    };

    const conn = await axios(configConn)
      .then((res) => {
        console.log('loaded', func);
        return res.status;
      })
      .catch((error) => {
        console.debug(func, 'error', error);
      });
    return conn;
  }
}
