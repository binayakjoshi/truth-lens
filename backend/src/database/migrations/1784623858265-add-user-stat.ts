import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class AddUserStat1784623858265 implements MigrationInterface {
  name = 'AddUserStat1784623858265';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'userStats',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'totalCount',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'fakeCount',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'realCount',
            type: 'int',
            default: 0,
            isNullable: false,
          },

          {
            name: 'uncertainCount',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'avgManupulationScore',
            type: 'decimal',
            precision: 5,
            scale: 4,
            default: 0,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'userStats',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'FK_user_stat_userId',
      }),
    );

    // --- Backfill: aggregate existing analysisHistories rows per user ---
    // avgManupulationScore is taken as the average fakeConfidence for that
    // user's scans, rounded to 4 decimal places to match the column scale.
    await queryRunner.query(`
      INSERT INTO "userStats"
        (id, "userId", "totalCount", "fakeCount", "realCount","uncertainCount", "avgManupulationScore", "createdAt", "updatedAt")
      SELECT
        uuid_generate_v4(),
        "userId",
        COUNT(*)::int AS "totalCount",
        COUNT(*) FILTER (WHERE classification = 'fake')::int AS "fakeCount",
        COUNT(*) FILTER (WHERE classification = 'real')::int AS "realCount",

        COUNT(*) FILTER (WHERE classification = 'uncertain')::int AS "uncertainCount",
        COALESCE(ROUND(AVG("fakeConfidence")::numeric, 4), 0) AS "avgManupulationScore",
        now(),
        now()
      FROM "analysisHistories"
      GROUP BY "userId"
    `);

    // --- Backfill: ensure every user has a userStats row, even with 0 scans ---
    await queryRunner.query(`
      INSERT INTO "userStats"
        (id, "userId", "totalCount", "fakeCount", "realCount","uncertainCount", "avgManupulationScore", "createdAt", "updatedAt")
      SELECT
        uuid_generate_v4(),
        u.id,
        0,
        0,
        0,
        0,
        0,
        now(),
        now()
      FROM "users" u
      LEFT JOIN "userStats" us ON us."userId" = u.id
      WHERE us.id IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('userStats');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('userStats', foreignKey);
    }
    await queryRunner.dropTable('userStats');
  }
}
