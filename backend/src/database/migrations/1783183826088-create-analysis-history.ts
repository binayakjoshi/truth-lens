import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateAnalysisHistory1783183826088 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'analysisHistories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'classification',
            type: 'enum',
            enum: ['real', 'fake'],
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'confidence',
            type: 'decimal',
            precision: 5,
            scale: 4,
            default: 0,
            isNullable: false,
          },
          {
            name: 'originalImageUrl',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'heatmapImageUrl',
            type: 'varchar',
            isNullable: false,
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
      'analysisHistories',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'analysisHistories',
      new TableIndex({
        name: 'IDX_ANALYSIS_HISTORY_USER_CREATED_AT',
        columnNames: ['userId', 'createdAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'analysisHistories',
      'IDX_ANALYSIS_HISTORY_USER_CREATED_AT',
    );

    const table = await queryRunner.getTable('analysisHistories');

    const foreignKey = table?.foreignKeys.find((fk) =>
      fk.columnNames.includes('userId'),
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey('analysisHistories', foreignKey);
    }

    await queryRunner.dropTable('analysisHistories');
  }
}
