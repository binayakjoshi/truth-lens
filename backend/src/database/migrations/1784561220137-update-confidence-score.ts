import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateConfidenceScore1784561220137 implements MigrationInterface {
  name = 'UpdateConfidenceScore1784561220137';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add new columns
    await queryRunner.query(`
      ALTER TABLE "analysisHistories"
      ADD COLUMN "realConfidence" decimal(5,4) NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "analysisHistories"
      ADD COLUMN "fakeConfidence" decimal(5,4) NOT NULL DEFAULT 0
    `);

    // 2. Migrate existing data
    // Adjust enum values if yours are lowercase.
    await queryRunner.query(`
UPDATE "analysisHistories"
SET
  "realConfidence" = CASE
    WHEN classification = 'real' THEN confidence
    WHEN classification = 'fake' THEN 1 - confidence
    WHEN classification = 'uncertain' THEN 0.5
  END,
  "fakeConfidence" = CASE
    WHEN classification = 'fake' THEN confidence
    WHEN classification = 'real' THEN 1 - confidence
    WHEN classification = 'uncertain' THEN 0.5
  END;
`);

    // 3. Remove old column
    await queryRunner.query(`
      ALTER TABLE "analysisHistories"
      DROP COLUMN "confidence"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Recreate old column
    await queryRunner.query(`
      ALTER TABLE "analysisHistories"
      ADD COLUMN "confidence" decimal(5,4) NOT NULL DEFAULT 0
    `);

    // 2. Restore confidence from whichever class the row represents
    await queryRunner.query(`
 UPDATE "analysisHistories"
SET "confidence" = CASE
  WHEN classification = 'real' THEN "realConfidence"
  WHEN classification = 'fake' THEN "fakeConfidence"
  ELSE 0.5
END;`);

    // 3. Remove new columns
    await queryRunner.query(`
      ALTER TABLE "analysisHistories"
      DROP COLUMN "realConfidence"
    `);

    await queryRunner.query(`
      ALTER TABLE "analysisHistories"
      DROP COLUMN "fakeConfidence"
    `);
  }
}
