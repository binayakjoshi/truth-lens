import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UseDeletedAt1781194403574 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'deletedAt',
        type: 'timestamp',
        isNullable: true,
        default: null,
      }),
    );

    await queryRunner.manager
      .createQueryBuilder()
      .update('users')
      .set({ deletedAt: () => `"createdAt"` })
      .where(`"isDeleted" = :isDeleted`, { isDeleted: true })
      .execute();

    await queryRunner.dropColumn('users', 'isDeleted');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'isDeleted',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    );

    await queryRunner.manager
      .createQueryBuilder()
      .update('users')
      .set({ isDeleted: true })
      .where(`"deletedAt" IS NOT NULL`)
      .execute();

    await queryRunner.dropColumn('users', 'deletedAt');
  }
}
