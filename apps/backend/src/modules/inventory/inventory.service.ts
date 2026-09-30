import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import {
  InventoryMovement,
  InventoryMovementReason,
  InventoryMovementType,
} from './entities/inventory-movement.entity';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { InventoryMovementQueryDto } from './dto/inventory-movement-query.dto';

export interface MovementContext {
  userId: string;
  reason: InventoryMovementReason;
  type: InventoryMovementType;
  quantity: number;
  notes?: string | null;
  orderId?: string | null;
  orderItemId?: string | null;
}

@Injectable()
export class InventoryService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(InventoryMovement)
    private readonly movementRepository: Repository<InventoryMovement>,
  ) {}

  async createManualMovement(
    dto: CreateInventoryMovementDto,
    userId: string,
  ): Promise<InventoryMovement> {
    this.validateManualReason(dto.type, dto.reason);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.product_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product) {
        throw new NotFoundException(`Producto con ID ${dto.product_id} no encontrado`);
      }

      const movement = await this.recordMovement(queryRunner.manager, product, {
        userId,
        type: dto.type,
        reason: dto.reason,
        quantity: dto.quantity,
        notes: dto.notes?.trim() || null,
      });
      await queryRunner.commitTransaction();
      return movement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findMovements(filters: InventoryMovementQueryDto): Promise<InventoryMovement[]> {
    const query = this.movementRepository
      .createQueryBuilder('movement')
      .leftJoin('movement.product', 'product')
      .addSelect(['product.id', 'product.name'])
      .leftJoin('movement.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.role'])
      .leftJoin('movement.order', 'order')
      .addSelect(['order.id', 'order.code'])
      .leftJoin('movement.orderItem', 'orderItem')
      .addSelect(['orderItem.id'])
      .orderBy('movement.created_at', 'DESC')
      .take(filters.limit ?? 50);

    if (filters.product_id) {
      query.andWhere('movement.product_id = :productId', {
        productId: filters.product_id,
      });
    }
    if (filters.reason) {
      query.andWhere('movement.reason = :reason', { reason: filters.reason });
    }
    if (filters.from) {
      query.andWhere('movement.created_at >= :from', { from: filters.from });
    }
    if (filters.to) {
      query.andWhere('movement.created_at <= :to', { to: filters.to });
    }

    return query.getMany();
  }

  async recordMovement(
    manager: EntityManager,
    product: Product,
    context: MovementContext,
  ): Promise<InventoryMovement> {
    const stockPrevious = product.stock_quantity;
    const stockResulting =
      context.type === InventoryMovementType.ENTRADA
        ? stockPrevious + context.quantity
        : stockPrevious - context.quantity;

    if (stockResulting < 0) {
      throw new BadRequestException(
        `Stock insuficiente de ${product.name} (Requeridos: ${context.quantity}, Disponibles: ${stockPrevious}).`,
      );
    }

    product.stock_quantity = stockResulting;
    await manager.save(Product, product);

    return manager.save(
      InventoryMovement,
      manager.create(InventoryMovement, {
        product_id: product.id,
        user_id: context.userId,
        order_id: context.orderId ?? null,
        order_item_id: context.orderItemId ?? null,
        type: context.type,
        reason: context.reason,
        quantity: context.quantity,
        stock_previous: stockPrevious,
        stock_resulting: stockResulting,
        notes: context.notes ?? null,
      }),
    );
  }

  private validateManualReason(
    type: InventoryMovementType,
    reason: InventoryMovementReason,
  ): void {
    if (
      reason === InventoryMovementReason.VENTA ||
      reason === InventoryMovementReason.CANCELACION_PEDIDO ||
      reason === InventoryMovementReason.AJUSTE_PEDIDO
    ) {
      throw new BadRequestException(
        'Ese motivo de movimiento solo puede generarse desde el flujo de pedidos.',
      );
    }

    const entryReasons = new Set([
      InventoryMovementReason.COMPRA,
      InventoryMovementReason.PRODUCCION,
      InventoryMovementReason.DEVOLUCION,
      InventoryMovementReason.INVENTARIO_INICIAL,
    ]);
    const exitReasons = new Set([
      InventoryMovementReason.REGALO_MUESTRA,
      InventoryMovementReason.CADUCO_VENCIDO,
      InventoryMovementReason.DANADO_PERDIDO,
    ]);

    if (
      (entryReasons.has(reason) && type !== InventoryMovementType.ENTRADA) ||
      (exitReasons.has(reason) && type !== InventoryMovementType.SALIDA)
    ) {
      throw new BadRequestException('El tipo de movimiento no corresponde al motivo seleccionado.');
    }
  }
}