import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { InventoryMovementReason } from '../entities/inventory-movement.entity';
import { POSTGRES_UUID_PATTERN } from '../../../common/validators/uuid-format';

export class InventoryMovementQueryDto {
  @Matches(POSTGRES_UUID_PATTERN)
  @IsOptional()
  product_id?: string;

  @IsEnum(InventoryMovementReason)
  @IsOptional()
  reason?: InventoryMovementReason;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 50;
}