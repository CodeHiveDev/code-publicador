import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { Dbf } from 'dbf-reader';
import { shp } from 'shpjs';
import { exec } from 'shelljs';
import axios from 'axios';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

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

    constructor(
        @Inject(forwardRef(() => ConfigService))
        private configService: ConfigService,
      ) {
        const GEOSERVER_HOST = this.configService.get<string>('geoserverService.SERVER_HOST');
        this.G_HOST = GEOSERVER_HOST;
        if (!GEOSERVER_HOST) {
            throw new Error(`GEOSERVER variables are missing`);
          }

        const GEOSERVER_AUTH = this.configService.get<string>('geoserverService.SERVER_AUTH');
        this.G_AUTH = GEOSERVER_AUTH;

        const GEOSERVER_USER = this.configService.get<string>('geoserverService.SERVER_USER');
        this.G_USER = GEOSERVER_USER;

        const GEOSERVER_PASS = this.configService.get<string>('geoserverService.SERVER_PASSWORD');
        this.G_PASS = GEOSERVER_PASS;


        const POSTGRES_HOST = this.configService.get<string>('postgisService.POSTGRES_HOST');
        this.P_HOST = POSTGRES_HOST;
        if (!POSTGRES_HOST) {
            throw new Error(`POSTGIS variables are missing`);
        }

        const POSTGRES_PORT = this.configService.get<number>('postgisService.POSTGRES_PORT');
        this.P_PORT = POSTGRES_PORT;

        const POSTGRES_USER = this.configService.get<string>('postgisService.POSTGRES_USER');
        this.P_USER = POSTGRES_USER;

        const POSTGRES_DB = this.configService.get<string>('postgisService.POSTGRES_DB');
        this.P_DB = POSTGRES_DB;

        const PGPASSWORD = this.configService.get<string>('postgisService.PGPASSWORD');
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
      'aws s3 cp s3://ho-backend-content-dev/' +
        folders3 +
        ' /tmp/' +
        folders3 +
        ' --recursive --exclude "*" --include "' +
        nameshapefile +
        '*"',
    );
    // Convert shp to postgis
    try {
      // Create table
      exec(
        'PGPASSWORD=' +
          this.P_PASS +
          ' psql -h ' +
          this.P_HOST +
          ' -d ' +
          this.P_DB +
          ' -p ' +
          this.P_PORT +
          ' -U ' +
          this.P_USER +
          ' -c "CREATE TABLE IF NOT EXISTS public.shapefiles ( idshapefile serial NOT NULL, id_0 integer NOT NULL, layername varchar(100), expediente text, categoria text, fecha date, geom geometry, PRIMARY KEY (idshapefile))" ',
      ); // -f "createshapefile"
      // Altern Table add column
      exec(
        'PGPASSWORD=' +
          this.P_PASS +
          ' psql -h ' +
          this.P_HOST +
          ' -d ' +
          this.P_DB +
          ' -p ' +
          this.P_PORT +
          ' -U ' +
          this.P_USER +
          ' -c "ALTER TABLE public.shapefiles ADD COLUMN IF NOT EXISTS layername varchar(100) DEFAULT ' +
          nameshapefile +
          ' " ',
      );
      // Shp Parser
      // this.ShpParser('/mnt/d/tmp/'+folders3+nameshapefile+'.shp')
      // Dbf Parser
      // this.DbfParser('/mnt/d/tmp/'+folders3+nameshapefile+'.dbf')

      // Check if exist the layer and then...
      this.getLayerName(nameshapefile)
        .then(async (res) => {
          // Shapefile to Postgis
          exec(
            'shp2pgsql -a -s 4326 -I -W "latin1" /tmp/' +
              pathandfile +
              ' public.shapefiles | PGAPPNAME="' +
              nameshapefile +
              '" PGPASSWORD=' +
              this.P_PASS +
              ' psql -h ' +
              this.P_HOST +
              ' -d ' +
              this.P_DB +
              ' -p ' +
              this.P_PORT +
              ' -U ' +
              this.P_USER +
              ' ',
          );
          // Insert field layername if is null
          exec(
            'PGPASSWORD=' +
            this.P_PASS +
              ' psql -h ' +
              this.P_HOST +
              ' -d ' +
              this.P_DB +
              ' -p ' +
              this.P_PORT +
              ' -U ' +
              this.P_USER +
              ' -c "UPDATE public.shapefiles SET layername = ' +
              "'" +
              nameshapefile +
              "'" +
              ' WHERE layername IS NULL" ',
          ); //AND fecha = atributo fecha

          // Geoserver Rest Publish
          await this.publishLayer(nameshapefile, type);
          // Create Style
          await this.createStyle(nameshapefile).then((res) => {
            // Load Style
            let sldfile = `/tmp/${folders3}${nameshapefile}.sld`;
            if (sldfile) this.uploadStyle(sldfile, nameshapefile);
          });

          // Apply Style
          await this.setLayerStyle(nameshapefile);
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
  private DbfParser(dbffile: any) {
    // Parse Dbf
    console.log('here', dbffile);
    let buffer: Buffer = fs.readFileSync(dbffile);
    let datatable = Dbf.read(buffer);
    console.log(datatable.columns);
    //setColumns(datatable.columns)
  }

  private ShpParser(shpfile: any) {
    console.log(shpfile);
    shp(shpfile)
      .then((geo) => {
        let geom = geo.features[0].geometry.type;
        console.log('shape', geo);
      })
      .catch((err) => {
        console.debug('rejected  (' + err + ')');
      });
  }

  private async getLayerName(layername) {
    return new Promise((resolve, reject) => {
      let config = {
        method: 'get',
        url: `http://${this.G_HOST}/geoserver/rest/workspaces/Mineria/datastores/postgis/featuretypes/${layername}.xml`,
        headers: {
          Authorization: `Basic ${this.G_AUTH}`,
          'Content-Type': 'application/xml',
        },
      };
      axios(config)
        .then((response) => {
          if (response.status == 200) {
            reject();
            console.warn('layer exists');
          } else {
            resolve('no_layer');
          }
        })
        .catch((error) => {
          resolve('no_layer');
          console.log('error en el get layer geoserver');
        });
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

  private createStyle(layername) {
    return new Promise(async (resolve, reject) => {
      let func = 'createStyle';
      let dataStyle = `<style><name>${layername}</name><filename>${layername}.sld</filename></style>`;
      let url = `http://${this.G_HOST}/geoserver/rest/styles`;
      let auth = `${this.G_AUTH}`;
      const conn = await this.connection(
        dataStyle,
        'post',
        url,
        auth,
        'xml',
        func,
      );
      if (conn !== null) {
        resolve('res');
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

  private setLayerStyle(layername) {
    let func = 'setLayerStyle';
    let dataStyle = `<layer>
                                <defaultStyle>
                                    <name>${layername}</name>
                                </defaultStyle>
                        </layer>`;
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

    await axios(configConn)
      .then((response) => {
        console.log('loaded', func);
      })
      .catch((error) => {
        console.debug(func, 'error', error);
      });
  }
}
