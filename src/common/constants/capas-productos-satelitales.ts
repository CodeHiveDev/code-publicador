import { Capa } from '../interfaces/capas.interface';
import { stylePoint } from './style-point';

export const capasProductosSatelitales: Capa[] = [
  {
    tabla: 'infracciones',
    geometria: { db: 'geom', shapefile: 'geometry' },
    propiedades: [
      { db: 'fecha', shapefile: 'FECHA' },
      { db: 'proc', shapefile: 'PROC' },
      { db: 'flujo', shapefile: 'FLUJO' },
      { db: 'version', shapefile: 'VERSION' },
      { db: 'satelite', shapefile: 'SATELITE' },
      { db: 'exp_id', shapefile: 'ID' },
      { db: 'categoria', shapefile: 'CATEGORIA' },
    ],
    retorna: 'id',
    style: stylePoint,
  },
  {
    tabla: 'no_registradas',
    geometria: { db: 'geom', shapefile: 'geometry' },
    propiedades: [
      { db: 'fecha', shapefile: 'FECHA' },
      { db: 'proc', shapefile: 'PROC' },
      { db: 'flujo', shapefile: 'FLUJO' },
      { db: 'version', shapefile: 'VERSION' },
      { db: 'satelite', shapefile: 'SATELITE' },
      { db: 'exp_id', shapefile: 'ID' },
      { db: 'categoria', shapefile: 'CATEGORIA' },
    ],
    retorna: 'id',
    style: stylePoint,
  },
];
