import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInventoryMovements1787688273717 implements MigrationInterface {
  name = 'AddInventoryMovements1787688273717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "is_available" TO "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "stock_quantity" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "min_stock_alert" integer NOT NULL DEFAULT 5`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "CHK_products_stock_nonnegative" CHECK ("stock_quantity" >= 0 AND "min_stock_alert" >= 0)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_movements_type_enum" AS ENUM('ENTRADA', 'SALIDA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_movements_reason_enum" AS ENUM('COMPRA', 'PRODUCCION', 'DEVOLUCION', 'REGALO_MUESTRA', 'CADUCO_VENCIDO', 'DANADO_PERDIDO', 'AJUSTE_MANUAL', 'INVENTARIO_INICIAL', 'VENTA', 'CANCELACION_PEDIDO', 'AJUSTE_PEDIDO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "inventory_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "user_id" uuid NOT NULL, "order_id" uuid, "order_item_id" uuid, "type" "public"."inventory_movements_type_enum" NOT NULL, "reason" "public"."inventory_movements_reason_enum" NOT NULL, "quantity" integer NOT NULL, "stock_previous" integer NOT NULL, "stock_resulting" integer NOT NULL, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_inventory_movements_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movements" ADD CONSTRAINT "CHK_inventory_movements_balance" CHECK ("quantity" > 0 AND "stock_previous" >= 0 AND "stock_resulting" >= 0 AND (("type" = 'ENTRADA' AND "stock_resulting" = "stock_previous" + "quantity") OR ("type" = 'SALIDA' AND "stock_resulting" = "stock_previous" - "quantity")))`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movements" ADD CONSTRAINT "FK_inventory_movements_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movements" ADD CONSTRAINT "FK_inventory_movements_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movements" ADD CONSTRAINT "FK_inventory_movements_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movements" ADD CONSTRAINT "FK_inventory_movements_order_item" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inventory_movements_product_created" ON "inventory_movements" ("product_id", "created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_inventory_movements_product_created"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movements" DROP CONSTRAINT "FK_inventory_movements_order_item"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movements" DROP CONSTRAINT "FK_inventory_movements_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movements" DROP CONSTRAINT "FK_inventory_movements_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movements" DROP CONSTRAINT "FK_inventory_movements_product"`,
    );
    await queryRunner.query(`DROP TABLE "inventory_movements"`);
    await queryRunner.query(
      `DROP TYPE "public"."inventory_movements_reason_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."inventory_movements_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "CHK_products_stock_nonnegative"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "min_stock_alert"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "stock_quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" RENAME COLUMN "is_active" TO "is_available"`,
    );
  }
}