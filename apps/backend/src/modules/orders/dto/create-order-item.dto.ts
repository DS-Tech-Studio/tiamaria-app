import { IsInt, IsPositive, IsNotEmpty, Matches } from 'class-validator';
import { POSTGRES_UUID_PATTERN } from '../../../common/validators/uuid-format';

export class CreateOrderItemDto {
  @Matches(POSTGRES_UUID_PATTERN)
  @IsNotEmpty()
  product_id!: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  quantity!: number;
}