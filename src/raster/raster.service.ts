import { Injectable } from '@nestjs/common';
import { exec } from 'shelljs';
import axios from 'axios';

@Injectable()
export class RasterService {
  public rasterHandler(fileraster: any, pathraster, folder, nameraster, type) {
    //console.log("the raster", fileraster)
    console.log('the raster', pathraster);
    exec(
      'aws s3 cp s3://ho-backend-content-dev/' +
        pathraster +
        ' /mnt/d/tmp/publicador',
    );
    exec(
      'raster2pgsql -s 4326 -a -I -C -M /mnt/d/tmp/' +
        pathraster +
        ' -F -t 256x256 public.rasters | PGPASSWORD=postgres psql -h 172.17.26.18 -d georaster -p 5436 -U postgres ',
    );
    //geoserver
    /*
            //create view 
        let data = `<featureType>
                <name>${nameraster}</name>
                <nativeName>${nameraster}</nativeName>
                <namespace>
                    <name>Mineria</name>
                    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate" href="http://k8s-ide-845572b3dc-594062474.us-east-1.elb.amazonaws.com/geoserver/rest/namespaces/mineria.xml" type="application/xml"/>
                </namespace>
                <title>${nameraster}</title>
                <keywords>
                    <string>features</string>
                    <string>${nameraster}</string>
                </keywords>
                <srs>EPSG:4326</srs>
                <projectionPolicy>FORCE_DECLARED</projectionPolicy>
                <enabled>true</enabled>
                <metadata>
                <entry key="cachingEnabled">false</entry>
                <entry key="JDBC_VIRTUAL_TABLE">
                <virtualTable>
                    <name>${nameraster}</name>
                    <sql>select rid, filename, rast from raster order by rid asc</sql>
                    <escapeSql>false</escapeSql>
                    <keyColumn>rid</keyColumn>
                    <geometry>
                        <name>the_geom</name>
                        <type>${type}</type>
                        <srid>4326</srid>
                    </geometry>
                </virtualTable>
                </entry>
                </metadata>
                <store class="dataStore">
                    <name>postgis</name>
                    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" rel="alternate" href="http://k8s-ide-845572b3dc-594062474.us-east-1.elb.amazonaws.com/geoserver/rest/workspaces/mineria/datastores/postgis.xml" type="application/xml"/>
                </store>
                <maxFeatures>0</maxFeatures>
                <numDecimals>0</numDecimals>
            </featureType>`


        // Create DataStore
        `<coverageStore>
              <name>${nameraster}</name>
              <type>GeoTIFF</type>
              <enabled>true</enabled>
              <workspace>mineria</workspace>` //?
              `<connectionParameters>
                <entry key="url">file:${nameraster}</entry>
                <entry key="namespace">Mineria</entry>
              </connectionParameters>
        </coverageStore>`

        // Upload file
        //curl -u admin:geoserver -v -XPUT -H "Content-Type: text/plain" -d "file:/C:/sat.tif" http://localhost:8080/geoserver/rest/workspaces/cite/coveragestores/my_store/external.geotiff?configure=first\&coverageName=my_store
       

          ///Publish layer      
           /* let data = `<featureType>
                        <enabled>true</enabled>
                        <srs>EPSG:4326</srs> 
                        <nativeBoundingBox>
                          <minx>-66.159209</minx>
                          <maxx>-65.948785</maxx>
                          <miny>-39.188522</miny>
                          <maxy>-39.183787</maxy>
                          <crs>EPSG:4326</crs>
                          <nativeCRS>EPSG:4326</nativeCRS>
                        </nativeBoundingBox>
                        <latLonBoundingBox>
                          <minx>-66.159209</minx>
                          <maxx>-65.948785</maxx>
                          <miny>-39.188522</miny>
                          <maxy>-39.183787</maxy>
                          <crs>EPSG:4326</crs>
                        </latLonBoundingBox>
                        <projectionPolicy>FORCE_DECLARED</projectionPolicy>
                        <name>${nombrevista}</name>
                        <id>${nombrevista}</id>
                    </featureType>`;
            let config = {
                    method: 'post',
                    url: `http://k8s-ide-845572b3dc-594062474.us-east-1.elb.amazonaws.com/geoserver/rest/workspaces/endevamProduccion/datastores/endevamProduccion/featuretypes`,
                    headers: { 
                      'Authorization': 'Basic YWRtaW46Z2Vvc2VydmVy', 
                      'Content-Type': 'application/xml'
                    },
                    data : data
                  };
            axios(config)
                .then((response) => {
                              console.log("loaded", response)
                })
                .catch((error) => {
                    console.log("error en el axios geoserver")
                    console.log(error);
                });
          
       */
    return 'done';
  }
}
