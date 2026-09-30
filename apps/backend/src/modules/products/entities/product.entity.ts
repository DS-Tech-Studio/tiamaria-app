import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { InventoryMovement } from '../../inventory/entities/inventory-movement.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'integer', default: 0 })
  stock_quantity!: number;

  @Column({ type: 'integer', default: 5 })
  min_stock_alert!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  is_available!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems!: OrderItem[];

  @OneToMany(() => InventoryMovement, (movement) => movement.product)
  inventoryMovements!: InventoryMovement[];

  @AfterLoad()
  updateAvailability(): void {
    this.is_available = this.is_active && this.stock_quantity > 0;
  }
}