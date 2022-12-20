import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ProductosSatelitalesCapas1671541611908
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'infracciones',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
            primaryKeyConstraintName: 'PK_infracciones',
          },
          {
            name: 'geom',
            type: 'geometry(Geometry,4326)',
          },
          {
            name: 'fecha',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'proc',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'flujo',
            type: 'varchar',
            length: '254',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'varchar',
            length: '254',
            isNullable: true,
          },
          {
            name: 'satelite',
            type: 'varchar',
            length: '254',
            isNullable: true,
          },
          {
            name: 'exp_id',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'categoria',
            type: 'integer',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'no_registradas',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'identity',
            primaryKeyConstraintName: 'PK_no_registradas',
          },
          {
            name: 'geom',
            type: 'geometry(Geometry,4326)',
          },
          {
            name: 'fecha',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'proc',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'flujo',
            type: 'varchar',
            length: '254',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'varchar',
            length: '254',
            isNullable: true,
          },
          {
            name: 'satelite',
            type: 'varchar',
            length: '254',
            isNullable: true,
          },
          {
            name: 'exp_id',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'categoria',
            type: 'integer',
            isNullable: true,
          },
        ],
      }),
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('no_registradas');
    await queryRunner.dropTable('infracciones');
  }
}
