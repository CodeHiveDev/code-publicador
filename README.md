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

## Variables de entorno

El aplicativo hace uso de un archivo para configurar las variables de entorno. Las variables de entorno que se deben configurar son las que se encuentran en el archivo `env.example` provisto en la raíz de esta app.

En la ruta `./src/config/envs/` se deben guardar los archivos que leera el aplicativo (basándose en el paquete `dotenv` dentro de NestJS) con la siguiente nomenclatura: `**ENVIROMENTE**.env`.

El nombre **ENVIROMENT** viene de la variable de entorno `NODE_ENV`. Se representa un ejemplo del nombre del archivo:

- `NODE_ENV=interno` -> el app buscará el archivo `interno.env` dentro de la carpeta `./src/config/envs/`.

En caso de no existir la variable, se busca el archivo `development.env`

## Migraciones

Se configura la app para poder subir o bajar de migraciones a partir del comando `npm typeorm...` añadiendo el scritp en el documento `package.json`. Para subir y/o bajar de migración se pueden usar los isguientes comandos:

- Para subir de hasta la última migración: `npm run typeorm migration:run`.
- Para bajar una versión de migración: `npm run typerom migration:revert`
