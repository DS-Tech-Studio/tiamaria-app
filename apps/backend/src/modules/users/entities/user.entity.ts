import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  VENDEDOR = 'VENDEDOR',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VENDEDOR,
  })
  role!: UserRole;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @OneToMany(() => Order, (order) => order.seller)
  orders!: Order[];
}