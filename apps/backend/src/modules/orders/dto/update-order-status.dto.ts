import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: 'El estado enviado no es un estado de pedido válido',
  })
  @IsNotEmpty()
  status!: OrderStatus;
}