import { ArrayMinSize, IsArray, IsInt, Matches, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { POSTGRES_UUID_PATTERN } from '../../../common/validators/uuid-format';

class ProduceOrderItemDto {
  @Matches(POSTGRES_UUID_PATTERN)
  order_item_id!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class ProduceOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProduceOrderItemDto)
  items!: ProduceOrderItemDto[];
}