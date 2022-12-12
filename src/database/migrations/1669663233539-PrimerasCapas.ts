import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class PrimerasCapas1669663233539 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'canteras',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
            primaryKeyConstraintName: 'PK_canteras',
          },
          {
            name: 'geom',
            type: 'geometry(MultiPolygon,4326)',
          },
          {
            name: 'expediente',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'titular',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'mineral',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'categoria',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'superficie',
            type: 'double precision',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'cateos',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
            primaryKeyConstraintName: 'PK_cateos',
          },
          {
            name: 'geom',
            type: 'geometry(MultiPolygon,4326)',
          },
          {
            name: 'expediente',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'titular',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'mineral',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'superficie',
            type: 'double precision',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'demasias',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
            primaryKeyConstraintName: 'PK_demasias',
          },
          {
            name: 'geom',
            type: 'geometry(MultiPolygon,4326)',
          },
          {
            name: 'expediente',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'titular',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'mineral',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'categoria',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'superficie',
            type: 'double precision',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'manifestaciones',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
            primaryKeyConstraintName: 'PK_manifestaciones',
          },
          {
            name: 'geom',
            type: 'geometry(MultiPolygon,4326)',
          },
          {
            name: 'expediente',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'titular',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'mineral',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'categoria',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'superficie',
            type: 'double precision',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'minas',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
            primaryKeyConstraintName: 'PK_minas',
          },
          {
            name: 'geom',
            type: 'geometry(MultiPolygon,4326)',
          },
          {
            name: 'expediente',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'titular',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'mineral',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'categoria',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'superficie',
            type: 'double precision',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'registro_de_acopios',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
            primaryKeyConstraintName: 'PK_registro_de_acopios',
          },
          {
            name: 'geom',
            type: 'geometry(MultiPoint,4326)',
          },
          {
            name: 'expediente',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'acopio',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'empresa',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'prop_repr',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'domicilio',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'dni',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'ubicacion',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'localidad',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'c_p',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'tel_fax',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'e_mail',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'yac_provee',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'mineral',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'servidumbres_de_ocupacion',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
            primaryKeyConstraintName: 'PK_servidumbres_de_ocupacion',
          },
          {
            name: 'geom',
            type: 'geometry(MultiPolygon,4326)',
          },
          {
            name: 'expediente',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'titular',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'superficie',
            type: 'double precision',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'servidumbres_de_paso',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
            primaryKeyConstraintName: 'PK_servidumbres_de_paso',
          },
          {
            name: 'geom',
            type: 'geometry(MultiLineString,4326)',
          },
          {
            name: 'expediente',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'titular',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'long_m',
            type: 'double precision',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'vacantes',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
            primaryKeyConstraintName: 'PK_vacantes',
          },
          {
            name: 'geom',
            type: 'geometry(MultiPolygon,4326)',
          },
          {
            name: 'expediente',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'titular',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'mineral',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'categoria',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'superficie',
            type: 'double precision',
            isNullable: true,
          },
        ],
      }),
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('vacantes');
    await queryRunner.dropTable('servidumbres_de_paso');
    await queryRunner.dropTable('servidumbres_de_ocupacion');
    await queryRunner.dropTable('registro_de_acopios');
    await queryRunner.dropTable('minas');
    await queryRunner.dropTable('manifestaciones');
    await queryRunner.dropTable('demasias');
    await queryRunner.dropTable('cateos');
    await queryRunner.dropTable('canteras');
  }
}
