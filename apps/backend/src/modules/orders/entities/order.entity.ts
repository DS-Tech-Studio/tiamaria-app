import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDIENTE = 'PENDIENTE',
  EN_PREPARACION = 'EN_PREPARACION',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code!: string;

  @Column({ type: 'uuid' })
  client_id!: string;

  @ManyToOne(() => Client, (client) => client.orders)
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @Column({ type: 'uuid' })
  seller_id!: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'seller_id' })
  seller!: User;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDIENTE,
  })
  status!: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items!: OrderItem[];
}