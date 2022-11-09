import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import path = require('path');
import { renderFile } from 'template-file';
import { response } from 'express';
import console = require('console');

@Injectable()
export class GeoserverService {
  private TPLDIR: string;
  private WORKSPACE:string;
  private STORE:string;
  constructor(
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.TPLDIR = path.join(__dirname, '..', 'modules', 'shaper', 'tpl');
    console.log('this.TPLDIR', this.TPLDIR);
    console.log('SERVER_HOST', this.configService.get<string>('DATABASE_HOST'));
    this.WORKSPACE = this.configService.get<string>('WORKSPACES');
    this.STORE = this.configService.get<string>('STORE');
  }
  host = this.configService.get<string>('SERVER_HOST');

  async getLayerName(layername: any) {
    try {
      const { data, status } = await firstValueFrom(
        this.httpService.get(
          `http://${this.host}/geoserver/rest/workspaces/Mineria/datastores/postgis/featuretypes/${layername}.xml`,
        ),
      );
      return data;
    } catch (e) {
      console.log('Error GetLayerName: ', e.message);
      return true;
    }
  }

  async publishLayer(layername: any, type: any) {
    try {
      const dataType = {
        nameshapefile: layername,
        G_HOST: this.host,
        type: type,
      };
      const datas = await renderFile(
        `${this.TPLDIR}/featureType.tpl`,
        dataType,
      );

      const { data, status } = await firstValueFrom(
        this.httpService.post(
          `http://${this.host}/geoserver/rest/workspaces/Mineria/datastores/postgis/featuretypes`,
          datas,
        ),
      );
      return data;
    } catch (e) {
      console.log('Error PublishLayer: ', e.message);

      return true;
    }
  }

  async getStyle(layername: any) {
    try {
      const { data, status } = await firstValueFrom(
        this.httpService.get(
          `http://${this.host}/geoserver/rest/styles/${layername}.sld`,
        ),
      );
      return data;
    } catch (e) {
      console.log('Error GetStyle: ', e.message);
      return true;
    }
  }
  async createStyle(layername: any) {
    try {
      const dataStyle = `<style><name>${layername}</name><filename>${layername}.sld</filename></style>`;

      const { data, status } = await firstValueFrom(
        this.httpService.post(
          `http://${this.host}/geoserver/rest/styles`,
          dataStyle,
        ),
      );

      return data;
    } catch (e) {
      console.log('Error createStyle: ', e.message);

      return true;
    }
  }
  async uploadStyle(sldfile: any, nameshapefile: any) {
    try {
      const style = fs.readFileSync(sldfile, { encoding: 'utf-8' });
      const { data, status } = await firstValueFrom(
        this.httpService.put(
          `http://${this.host}/geoserver/rest/styles/${nameshapefile}`,
          style,
          { headers: { 'Content-Type': `application/vnd.ogc.sld+xml` } },
        ),
      );

      return data;
    } catch (e) {
      console.log('Error uploadStyle: ', e);
      return true;
    }
  }

  async setLayerStyle(layername: any, stylename: any) {
    try {
      const dataStyle = `<layer><defaultStyle><name>${stylename}</name></defaultStyle></layer>`;
      const { data, status } = await firstValueFrom(
        this.httpService.put(
          `http://${this.host}/geoserver/rest/layers/Mineria:${layername}`,
          dataStyle,
        ),
      );

      return data;
    } catch (e) {
      console.log('Error uploadStyle: ', e.message);

      return true;
    }
  }
  async publishRaster(file: any, type: any) {
    try {

      const datafile = `${this.WORKSPACE}/${this.STORE}/${file}`;

      const { data, status } = await firstValueFrom(
        this.httpService.post(
          `http://${this.host}/geoserver/rest/workspaces/${this.WORKSPACE}/coveragestores/${this.STORE}/external.imagemosaic?recalculate=nativebbox,latlonbbox`,
          datafile,
          { headers: { 'Content-Type': `text/plain` } },
        ),
      );
      return data;
    } catch (e) {
      console.log('Error PublishLayer: ', e.message);

      return true;
    }
  }

  async uploadRaster(file: any, type: any) {
    try {

      const pathfile = `${this.WORKSPACE}/${this.STORE}/${file}`;

      const fileZip = fs.createReadStream(`/temp/${pathfile}`)

      const { data, status } = await firstValueFrom(
        this.httpService.post(
          `http://${this.host}/geoserver/rest/workspaces/${this.WORKSPACE}/coveragestores/${this.STORE}/file.imagemosaic?configure=false`,
          fileZip,
          { headers: { 'Content-Type': `application/zip` } },
        ),
      );
      return data;
    } catch (e) {
      console.log('Error PublishLayer: ', e.message);

      return true;
    }
  }

}
