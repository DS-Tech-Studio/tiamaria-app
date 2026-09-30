import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  InventoryMovementReason,
  InventoryMovementType,
} from '../entities/inventory-movement.entity';
import { POSTGRES_UUID_PATTERN } from '../../../common/validators/uuid-format';

export class CreateInventoryMovementDto {
  @Matches(POSTGRES_UUID_PATTERN)
  product_id!: string;

  @IsEnum(InventoryMovementType)
  type!: InventoryMovementType;

  @IsEnum(InventoryMovementReason)
  reason!: InventoryMovementReason;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  notes?: string;
}