import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDbExtensions1780333378900 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `);

    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp";`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "pgcrypto";`);
  }
}
