import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeClientContactFieldsOptional1762372030000 implements MigrationInterface {
  name = 'MakeClientContactFieldsOptional1762372030000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "clients"
      ALTER COLUMN "phone" DROP NOT NULL,
      ALTER COLUMN "address" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "clients"
      ALTER COLUMN "address" SET NOT NULL,
      ALTER COLUMN "phone" SET NOT NULL
    `);
  }
}
