import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteAnonymousUsages1784198927105 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('anonymousUsages');
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
