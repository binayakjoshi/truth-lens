import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAnonymousUsage1782235660624 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'anonymousUsages',
        columns: [
          {
            name: 'identifier',
            type: 'varchar',
            isNullable: false,
            isPrimary: true,
          },
          {
            name: 'usageDate',
            type: 'date',
            isNullable: false,
            isPrimary: true,
          },
          {
            name: 'requestCount',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('anonymousUsages');
  }
}
