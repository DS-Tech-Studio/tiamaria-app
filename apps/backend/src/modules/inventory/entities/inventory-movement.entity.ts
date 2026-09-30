import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

export enum InventoryMovementType {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
}

export enum InventoryMovementReason {
  COMPRA = 'COMPRA',
  PRODUCCION = 'PRODUCCION',
  DEVOLUCION = 'DEVOLUCION',
  REGALO_MUESTRA = 'REGALO_MUESTRA',
  CADUCO_VENCIDO = 'CADUCO_VENCIDO',
  DANADO_PERDIDO = 'DANADO_PERDIDO',
  AJUSTE_MANUAL = 'AJUSTE_MANUAL',
  INVENTARIO_INICIAL = 'INVENTARIO_INICIAL',
  VENTA = 'VENTA',
  CANCELACION_PEDIDO = 'CANCELACION_PEDIDO',
  AJUSTE_PEDIDO = 'AJUSTE_PEDIDO',
}

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  product_id!: string;

  @ManyToOne(() => Product, (product) => product.inventoryMovements, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid', nullable: true })
  order_id!: string | null;

  @ManyToOne(() => Order, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order!: Order | null;

  @Column({ type: 'uuid', nullable: true })
  order_item_id!: string | null;

  @ManyToOne(() => OrderItem, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem!: OrderItem | null;

  @Column({ type: 'enum', enum: InventoryMovementType })
  type!: InventoryMovementType;

  @Column({ type: 'enum', enum: InventoryMovementReason })
  reason!: InventoryMovementReason;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ type: 'integer' })
  stock_previous!: number;

  @Column({ type: 'integer' })
  stock_resulting!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}