import { Injectable, forwardRef, Inject, ConsoleLogger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import path = require('path');
import os = require('os');
import { HelperService } from '../../../helper/helper.service';
import { GeoserverService } from '@services/geoserver.service';
import { render, renderFile } from 'template-file';
import { AppConfigService } from 'src/config/config.service';
@Injectable()
export class ShaperService {
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
  private TEMDIR: string;
  private TPLDIR: string;
  constructor(
    // TODO: eliminado forwardRed 2
    private appConfigService: AppConfigService,
    private GeoService: GeoserverService,
    private helperService: HelperService,
  ) {
    this.G_HOST = this.appConfigService.serverHost;

    // get temp directory
    this.TEMDIR = os.tmpdir(); // /tmp
    this.TPLDIR = path.join(__dirname, '..', '..', 'tpl');

    if (!this.G_HOST) {
      throw new Error(`GEOSERVER variables are missing`);
    }

    const BUCKETNAME = this.appConfigService.bucketName;
    this.PBUCKETNAME = BUCKETNAME;

    const GEOSERVER_USER = this.appConfigService.serverUser;
    this.G_USER = GEOSERVER_USER;

    const GEOSERVER_PASS = this.appConfigService.serverPassword;
    this.G_PASS = GEOSERVER_PASS;

    const POSTGRES_HOST = this.appConfigService.postgresHost;

    this.P_HOST = POSTGRES_HOST;

    const POSTGRES_PORT = this.appConfigService.postgresPort;
    this.P_PORT = POSTGRES_PORT;

    const POSTGRES_USER = this.appConfigService.postgresUser;
    this.P_USER = POSTGRES_USER;

    const POSTGRES_DB = this.appConfigService.postgresDb;
    this.P_DB = POSTGRES_DB;

    const PGPASSWORD = this.appConfigService.pgPassword;
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
    //await this.dbHelperQ.copyS3execTmp(nameshapefile, folders3);
    await this.helperService.s3download(nameshapefile, folders3);
    // Convert shp to postgis
    // Create table
    await this.helperService.createTable(nameshapefile);

    await this.GeoService.getLayerName(`${nameshapefile}`);

    await this.helperService.shapefilesToPosg(pathandfile, nameshapefile);

    await this.helperService.shapefilesUpdate(nameshapefile);

    await this.GeoService.publishLayer(nameshapefile, type);

    await this.GeoService.getStyle(`${nameshapefile}_style`);

    await this.GeoService.createStyle(`${nameshapefile}_style`);

    const sldfile = path.join(this.TEMDIR, folders3, `${nameshapefile}.sld`);
    console.log(sldfile);
    await this.GeoService.uploadStyle(sldfile, `${nameshapefile}_style`);

    // Apply Style
    await this.GeoService.setLayerStyle(
      nameshapefile,
      `${nameshapefile}_style`,
    );

    const tempdelete = path.join(this.TEMDIR, folders3);

    //await fs.rmSync(tempdelete, { recursive: true, force: true });

    // Delete layer if need
    // DELETE http://<url>/geoserver/rest/workspaces/<workspaceName>/coveragestores/<storeName>/coverages/<layerName>?recurse=true
    return 'done';
  }
}
