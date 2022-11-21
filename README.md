
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
```
Extensiones de Geoserver. 

gdal-3.2.0
gs-gdal-2.21-SNAPSHOT
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