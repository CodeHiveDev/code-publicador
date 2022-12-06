import { CapasCatastroMinero } from '../interfaces/capas-catastro-minero.interface';

export const capasCatastroMinero: CapasCatastroMinero[] = [
  {
    tabla: 'demasias',
    geometria: { db: 'geom', shapefile: 'geometry' },
    propiedades: [
      { db: 'expediente', shapefile: 'expediente' },
      { db: 'titular', shapefile: 'titular' },
      { db: 'nombre', shapefile: 'nombre' },
      { db: 'mineral', shapefile: 'mineral' },
      { db: 'categoria', shapefile: 'categoria' },
      { db: 'superficie', shapefile: 'superficie' },
    ],
    retorna: 'id',
  },
];
