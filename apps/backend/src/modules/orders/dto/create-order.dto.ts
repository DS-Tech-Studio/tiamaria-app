import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Matches,
  IsEnum,
  IsIn,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';
import { POSTGRES_UUID_PATTERN } from '../../../common/validators/uuid-format';
import {
  ORDER_DISCOUNT_PERCENTAGES,
  PaymentMethod,
} from '../entities/order.entity';

export class CreateOrderDto {
  @Matches(POSTGRES_UUID_PATTERN)
  @IsNotEmpty()
  client_id!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  payment_method?: PaymentMethod;

  @IsString()
  @IsOptional()
  receipt_image_url?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsIn([0, ...ORDER_DISCOUNT_PERCENTAGES])
  @IsOptional()
  discount_percent?: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'El pedido debe contener al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}