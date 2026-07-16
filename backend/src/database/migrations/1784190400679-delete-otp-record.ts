import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteOtpRecord1784190400679 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('otpRecords');
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
