interface ColumnasCapa {
  db: string;
  shapefile: string;
}

export interface Capa {
  tabla: string;
  geometria: ColumnasCapa;
  propiedades: ColumnasCapa[];
  retorna: string;
  style: string;
}
