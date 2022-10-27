import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import path = require('path');
import { renderFile } from 'template-file';
import { response } from 'express';

@Injectable()
export class GeoserverService {
  private TPLDIR: string;
  constructor(
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.TPLDIR = path.join(__dirname, '..', 'modules', 'shaper', 'tpl');
    console.log('this.TPLDIR', this.TPLDIR);
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

      let datasw = `<featureType>
      <name>${layername}</name>
      <nativeName>${layername}</nativeName>
      <namespace>
          <name>Mineria</name>
          <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate" href="http://${process.env.SERVER_HOST}/geoserver/rest/namespaces/Mineria.xml" type="application/xml"/>
      </namespace>
      <title>${layername}</title>
      <keywords>
          <string>features</string>
          <string>${layername}</string>
      </keywords>
      <srs>EPSG:4326</srs>
      <projectionPolicy>FORCE_DECLARED</projectionPolicy>
      <enabled>true</enabled>
      <metadata>
          <entry key="cachingEnabled">false</entry>
          <entry key="JDBC_VIRTUAL_TABLE">
          <virtualTable>
              <name>${layername}</name>
              <sql>select idshapefile, id_0, layername, expediente, categoria, fecha, geom  from shapefiles where layername = '${layername}' order by idshapefile asc</sql>
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
          <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate" href="http://${process.env.SERVER_HOST}/geoserver/rest/workspaces/Mineria/datastores/postgis.xml" type="application/xml"/>
      </store>
      <maxFeatures>0</maxFeatures>
      <numDecimals>0</numDecimals>
  </featureType>`;

      const { data, status } = await firstValueFrom(
        this.httpService.post(
          `http://${this.host}/geoserver/rest/workspaces/Mineria/datastores/postgis/featuretypes`,
          datasw,
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
      console.log('Error uploadStyle: ', e.message);

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
}
