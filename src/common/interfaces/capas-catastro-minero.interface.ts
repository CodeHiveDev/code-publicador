interface ColumnasCapas {
  db: string;
  shapefile: string;
}

export interface CapasCatastroMinero {
  tabla: string;
  geometria: ColumnasCapas;
  propiedades: ColumnasCapas[];
  retorna: string;
  style: string;
}
