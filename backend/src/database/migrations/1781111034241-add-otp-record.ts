import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class AddOtpRecord1781111034241 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'otpRecords',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '6',
            isNullable: false,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'isUsed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'otpRecords',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('otpRecords');

    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey('otpRecords', foreignKey);
    }

    await queryRunner.dropTable('otpRecords');
  }
}
