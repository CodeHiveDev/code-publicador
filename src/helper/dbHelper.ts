import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class dbHelper {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  //Create table
  public async createTable(nameshapefile: string) {
    this.dataSource.query(
      `CREATE TABLE IF NOT EXISTS public.shapefiles ( idshapefile serial NOT NULL, id_0 integer NOT NULL, layername varchar(100), expediente text, categoria text, fecha date, geom geometry, PRIMARY KEY (idshapefile))`,
    );

    this.dataSource.query(
      `ALTER TABLE public.shapefiles ADD COLUMN IF NOT EXISTS layername varchar(100) DEFAULT ${nameshapefile}`,
    );
  }

  //Create table
  public async shapefilesUpdate(nameshapefile: string) {
    this.dataSource.query(
      `UPDATE public.shapefiles SET layername =  ${nameshapefile} WHERE layername IS NULL`,
    ); //AND fecha = atributo fecha
  }
}
