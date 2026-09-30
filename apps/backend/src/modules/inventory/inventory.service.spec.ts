import { DataSource, EntityManager, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import {
  InventoryMovementReason,
  InventoryMovementType,
} from './entities/inventory-movement.entity';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let manager: EntityManager;

  beforeEach(() => {
    manager = {
      create: jest.fn((_entity, value) => value),
      save: jest.fn(async (_entity, value) => value),
    } as unknown as EntityManager;
    service = new InventoryService(
      {} as DataSource,
      {} as Repository<never>,
    );
  });

  it('records the previous and resulting balance for an entry', async () => {
    const product = {
      id: 'product-id',
      name: 'Galletas',
      stock_quantity: 3,
    } as Product;

    const movement = await service.recordMovement(manager, product, {
      userId: 'user-id',
      type: InventoryMovementType.ENTRADA,
      reason: InventoryMovementReason.PRODUCCION,
      quantity: 4,
    });

    expect(product.stock_quantity).toBe(7);
    expect(movement.stock_previous).toBe(3);
    expect(movement.stock_resulting).toBe(7);
  });

  it('rejects an exit that would make stock negative', async () => {
    const product = {
      id: 'product-id',
      name: 'Galletas',
      stock_quantity: 2,
    } as Product;

    await expect(
      service.recordMovement(manager, product, {
        userId: 'user-id',
        type: InventoryMovementType.SALIDA,
        reason: InventoryMovementReason.REGALO_MUESTRA,
        quantity: 3,
      }),
    ).rejects.toThrow('Stock insuficiente de Galletas');
    expect(product.stock_quantity).toBe(2);
    expect(manager.save).not.toHaveBeenCalled();
  });
});