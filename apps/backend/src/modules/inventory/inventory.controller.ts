import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { InventoryMovementQueryDto } from './dto/inventory-movement-query.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@Roles(UserRole.ADMIN)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('movements')
  createMovement(
    @Body() dto: CreateInventoryMovementDto,
    @Req() req: { user: User },
  ) {
    return this.inventoryService.createManualMovement(dto, req.user.id);
  }

  @Get('movements')
  findMovements(@Query() filters: InventoryMovementQueryDto) {
    return this.inventoryService.findMovements(filters);
  }
}