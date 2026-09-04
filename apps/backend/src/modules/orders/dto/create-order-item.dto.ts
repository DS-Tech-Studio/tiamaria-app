import { IsUUID, IsInt, IsPositive, IsNotEmpty } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  product_id!: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  quantity!: number;
}