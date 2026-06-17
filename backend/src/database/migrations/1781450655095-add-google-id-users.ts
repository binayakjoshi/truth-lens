import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGoogleIdUsers1781450655095 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'users',
      'password',
      new TableColumn({
        name: 'password',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'googleId',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'googleId');

    await queryRunner.changeColumn(
      'users',
      'password',
      new TableColumn({
        name: 'password',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }
}
