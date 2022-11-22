## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Requerimientos GEOSERVER

[GDAL Plugin](https://docs.geoserver.org/stable/en/user/data/raster/gdal.html)
[Download](https://build.geoserver.org/geoserver/2.21.x/ext-latest/geoserver-2.21-SNAPSHOT-gdal-plugin.zip)

```
Extensiones de Geoserver.

gdal-3.2.0
gs-gdal-2.21-SNAPSHOT
```

## Inicializacion

```bash
./init_store.sh <workspace> <store>
```

Ejemplo

```bash
./init_store.sh invap rasters
```

## Config json Raster (raster.json)

```
{
  "action": { "DataType": "String", "StringValue": "semaforo" },
  "folder": { "DataType": "String", "StringValue": "publicador/rasters" },
  "store": { "DataType": "String", "StringValue": "canteras" },
  "type": { "DataType": "String", "StringValue": "tif" }
}
```

## Config json shapefile (shapefile.json)

```
{
  "action": { "DataType": "String", "StringValue": "shapefile" },
  "folder": { "DataType": "String", "StringValue": "publicador/semaforo2/" },
  "multiplesfiles": { "DataType": "String", "StringValue": "false" },
  "filename": {
    "DataType": "String",
    "StringValue": "semaforo_canteras_faja4"
  },
  "type": { "DataType": "String", "StringValue": "shp" }
}

```

## Test ShaperFile

```bash
# development
$ cd ./test
$ /publish.sh shapefile

```

## Test Raster

```bash
# development
$ cd ./test
$ /publish.sh raster

```
