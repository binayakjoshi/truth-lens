import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddUserTable1780508462956 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'firstName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'lastName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'username',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'isVerified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'isDeleted',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_USERNAME',
        columnNames: ['username'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_EMAIL',
        columnNames: ['email'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_USERS_USERNAME');
    await queryRunner.dropIndex('users', 'IDX_USERS_EMAIL');
    await queryRunner.dropTable('users');
  }
}
