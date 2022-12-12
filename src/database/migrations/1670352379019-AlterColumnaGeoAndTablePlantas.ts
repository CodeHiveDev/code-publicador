import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AlterColumnaGeoAndTablePlantas1670352379019
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "canteras" ALTER COLUMN "geom" TYPE geometry(Geometry,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "cateos" ALTER COLUMN "geom" TYPE geometry(Geometry,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "demasias" ALTER COLUMN "geom" TYPE geometry(Geometry,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "manifestaciones" ALTER COLUMN "geom" TYPE geometry(Geometry,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "minas" ALTER COLUMN "geom" TYPE geometry(Geometry,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "registro_de_acopios" ALTER COLUMN "geom" TYPE geometry(Geometry,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "servidumbres_de_ocupacion" ALTER COLUMN "geom" TYPE geometry(Geometry,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "servidumbres_de_paso" ALTER COLUMN "geom" TYPE geometry(Geometry,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacantes" ALTER COLUMN "geom" TYPE geometry(Geometry,4326)`,
    );

    await queryRunner.query(`ALTER TABLE "cateos" DROP COLUMN "mineral"`);

    await queryRunner.createTable(
      new Table({
        name: 'registro_de_plantas',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
            primaryKeyConstraintName: 'PK_registro_de_plantas',
          },
          {
            name: 'geom',
            type: 'geometry(Geometry,4326)',
          },
          {
            name: 'expediente',
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
            name: 'titular',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'apoderado',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'tipo_de_pl',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'materia_pr',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'proceso_de',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'producto_f',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'yacimiento',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'personal',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'porc_empleo_l',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'inversiones',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'instalacion',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'volumen_de',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'promedio_m',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'comerciali',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'exportacion',
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
            name: 'tel_fax',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'dja',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'fecha_de_p',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'sellado_de',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'observaciones',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
        ],
      }),
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('registro_de_plantas');

    await queryRunner.query(
      `ALTER TABLE "cateos" ADD COLUMN "mineral" varchar(255)`,
    );

    await queryRunner.query(
      `ALTER TABLE "vacantes" ALTER COLUMN "geom" TYPE geometry(MultiPolygon,4326) USING ST_Multi(geom)`,
    );
    await queryRunner.query(
      `ALTER TABLE "servidumbres_de_paso" ALTER COLUMN "geom" TYPE geometry(MultiLineString,4326) USING ST_Multi(geom)`,
    );
    await queryRunner.query(
      `ALTER TABLE "servidumbres_de_ocupacion" ALTER COLUMN "geom" TYPE geometry(MultiPolygon,4326) USING ST_Multi(geom)`,
    );
    await queryRunner.query(
      `ALTER TABLE "registro_de_acopios" ALTER COLUMN "geom" TYPE geometry(MultiPoint,4326) USING ST_Multi(geom)`,
    );
    await queryRunner.query(
      `ALTER TABLE "minas" ALTER COLUMN "geom" TYPE geometry(MultiPolygon,4326) USING ST_Multi(geom)`,
    );
    await queryRunner.query(
      `ALTER TABLE "manifestaciones" ALTER COLUMN "geom" TYPE geometry(MultiPolygon,4326) USING ST_Multi(geom)`,
    );
    await queryRunner.query(
      `ALTER TABLE "demasias" ALTER COLUMN "geom" TYPE geometry(MultiPolygon,4326) USING ST_Multi(geom)`,
    );
    await queryRunner.query(
      `ALTER TABLE "cateos" ALTER COLUMN "geom" TYPE geometry(MultiPolygon,4326) USING ST_Multi(geom)`,
    );
    await queryRunner.query(
      `ALTER TABLE "canteras" ALTER COLUMN "geom" TYPE geometry(MultiPolygon,4326) USING ST_Multi(geom)`,
    );
  }
}
