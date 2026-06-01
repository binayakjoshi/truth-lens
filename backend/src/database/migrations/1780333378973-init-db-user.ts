import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDbUser1780333378973 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const username = process.env.DB_USERNAME || 'db_user';
    const password = process.env.DB_PASSWORD || 'db_user_password';
    const database = process.env.POSTGRES_DATABASE || 'truthLens';

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM pg_catalog.pg_roles WHERE rolname = '${username}'
        ) THEN
          CREATE ROLE ${username} LOGIN PASSWORD '${password}';
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      GRANT CONNECT ON DATABASE "${database}" TO ${username};
    `);

    await queryRunner.query(`
      GRANT USAGE ON SCHEMA public TO ${username};
    `);
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT SELECT, INSERT, UPDATE, DELETE
      ON TABLES TO ${username};
    `);

    await queryRunner.query(`
      GRANT USAGE, SELECT
      ON ALL SEQUENCES IN SCHEMA public
      TO ${username};
    `);

    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT USAGE, SELECT
      ON SEQUENCES TO ${username};
    `);
    await queryRunner.query(`
      GRANT SELECT, INSERT, UPDATE, DELETE
      ON ALL TABLES IN SCHEMA public
      TO ${username};
    `);
  }
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
