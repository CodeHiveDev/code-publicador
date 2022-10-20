import { Injectable, forwardRef, Inject, ConsoleLogger } from '@nestjs/common';
import { exec } from 'shelljs';
import axios from 'axios';
import * as fs from 'fs';
import { readFileSync } from 'fs';
import { ConfigService } from '@nestjs/config';
import path = require('path');
import { dbHelper } from '../helper/dbHelper';
import { render, renderFile } from 'template-file';
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

    const GEOSERVER_AUTH = this.configService.get<string>('SERVER_AUTH');
    this.G_AUTH = GEOSERVER_AUTH;

    const GEOSERVER_USER = this.configService.get<string>('SERVER_USER');
    this.G_USER = GEOSERVER_USER;

    const GEOSERVER_PASS = this.configService.get<string>('SERVER_PASSWORD');
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
  public async shapeHandler(
    fileshape: any,
    pathandfile,
    folders3,
    nameshapefile,
    type,
  ) {
    // Copy S3 file to a temp storage
    this.dbHelperQ.copyS3Tmp(nameshapefile, folders3);

    // Convert shp to postgis
    try {
      // Create table
      //this.dbHelperQ.createTable(nameshapefile);

      // Check if exist the layer and then...
      this.getLayerName(nameshapefile)
        .then(async (res) => {
          // Shapefile to Postgis
          this.dbHelperQ.shapefilesToPosg(pathandfile, nameshapefile);

          // Insert field layername if is null
          //this.dbHelperQ.shapefilesUpdate(nameshapefile);

          // Geoserver Rest Publish
          await this.publishLayer(nameshapefile, type);
          // Get Style If exist
          this.getStyle('semaforo_style')
            .then(async (res) => {
              // Create Style
              await this.createStyle('semaforo_style')
                .then(async (res) => {
                  // UpLoad Style
                  const sldfile = `/tmp/${folders3}${nameshapefile}.sld`;
                  // const sldfile = path.join(
                  //   __dirname,
                  //   '..',
                  //   '/common/files/semaforo_style.sld',
                  // );
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
      const config = {
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
      const config = {
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
    const func = 'publishLayer';

    const appRoot = path.resolve(__dirname);
    const dataType = {
      nameshapefile: nameshapefile,
      G_HOST: this.G_HOST,
      type: type,
    };

    // Replace variables in a file (same as above, but from a file)
    const data = await renderFile(
      `${appRoot}/assest/featureType.tpl`,
      dataType,
    );
    //console.log(data);

    // Style layer
    // Post Config
    const url = `http://${this.G_HOST}/geoserver/rest/workspaces/Mineria/datastores/postgis/featuretypes`;
    const auth = `${this.G_AUTH}`;
    this.connection(data, 'post', url, auth, 'xml', func);
  }

  private async createStyle(layername) {
    return new Promise(async (resolve, reject) => {
      const func = 'createStyle';
      const dataStyle = `<style><name>${layername}</name><filename>${layername}.sld</filename></style>`;
      const url = `http://${this.G_HOST}/geoserver/rest/styles`;

      const config = {
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
    const func = 'uploadStyle';
    const url = `http://${this.G_HOST}/geoserver/rest/styles/${layername}`; //?name=${layername}` ?raw=true
    const auth = `${this.G_AUTH}`;
    const style = fs.readFileSync(sldfile, { encoding: 'utf8' });
    this.connection(style, 'put', url, auth, 'vnd.ogc.sld+xml', func);
  }

  private setLayerStyle(layername, stylename) {
    const func = 'setLayerStyle';
    const dataStyle = `<layer><defaultStyle><name>${stylename}</name></defaultStyle></layer>`;
    const url = `http://${this.G_HOST}/geoserver/rest/layers/Mineria:${layername}`;
    const auth = `${this.G_AUTH}`;
    this.connection(dataStyle, 'put', url, auth, 'xml', func);
  }

  private async connection(dataIn, method, urlParams, auth, contentType, func) {
    const configConn = {
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
