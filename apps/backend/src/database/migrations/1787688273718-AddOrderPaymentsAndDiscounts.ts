import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderPaymentsAndDiscounts1787688273718
  implements MigrationInterface
{
  name = 'AddOrderPaymentsAndDiscounts1787688273718';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."orders_payment_method_enum" AS ENUM('EFECTIVO', 'TRANSFERENCIA')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "discount_amount" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "discount_percent" smallint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "payment_method" "public"."orders_payment_method_enum" NOT NULL DEFAULT 'EFECTIVO'`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "receipt_image_url" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "receipt_image_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "payment_method"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "discount_percent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "discount_amount"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."orders_payment_method_enum"`,
    );
  }
}
