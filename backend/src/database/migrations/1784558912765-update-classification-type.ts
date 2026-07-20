import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateClassificationType1784558912765 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "analysisHistories_classification_enum"
      ADD VALUE IF NOT EXISTS 'uncertain';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing enum values.
    // Recreate the enum without "uncertain".

    await queryRunner.query(`
      ALTER TYPE "analysisHistories_classification_enum"
      RENAME TO "analysisHistories_classification_enum_old";
    `);

    await queryRunner.query(`
      CREATE TYPE "analysisHistories_classification_enum" AS ENUM (
        'real',
        'fake'
      );
    `);

    // Ensure no rows still contain 'uncertain'
    await queryRunner.query(`
      UPDATE "analysisHistories"
      SET "classification" = 'fake'
      WHERE "classification" = 'uncertain';
    `);

    await queryRunner.query(`
      ALTER TABLE "analysisHistories"
      ALTER COLUMN "classification"
      TYPE "analysisHistories_classification_enum"
      USING "classification"::text::"analysisHistories_classification_enum";
    `);

    await queryRunner.query(`
      DROP TYPE "analysis_history_classification_enum_old";
    `);
  }
}
