import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ORDER_DISCOUNT_PERCENTAGES,
  Order,
  OrderStatus,
  PaymentMethod,
} from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Client } from '../clients/entities/client.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { FirebaseService } from '../notifications/firebase.service';
import {
  InventoryMovementReason,
  InventoryMovementType,
} from '../inventory/entities/inventory-movement.entity';
import { InventoryService } from '../inventory/inventory.service';
import { ProduceOrderDto } from './dto/produce-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly inventoryService: InventoryService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly firebaseService: FirebaseService,
  ) {}

  private validatePaymentDetails(
    paymentMethod: PaymentMethod,
    receiptImageUrl?: string | null,
  ): void {
    if (
      paymentMethod === PaymentMethod.TRANSFERENCIA &&
      !receiptImageUrl?.trim()
    ) {
      throw new BadRequestException(
        'Debes adjuntar el comprobante para pagos por transferencia.',
      );
    }
  }

  private validateDiscountPercent(discountPercent: number): void {
    if (
      discountPercent !== 0 &&
      !ORDER_DISCOUNT_PERCENTAGES.includes(
        discountPercent as (typeof ORDER_DISCOUNT_PERCENTAGES)[number],
      )
    ) {
      throw new BadRequestException('El porcentaje de descuento no es válido.');
    }
  }

  private calculateDiscount(subtotal: number, discountPercent: number): number {
    return Math.round(subtotal * discountPercent) / 100;
  }

  /**
   * Registra una venta transaccional usando QueryRunner.
   */
  async create(createOrderDto: CreateOrderDto, sellerId: string): Promise<Order> {
    const {
      client_id,
      notes,
      items,
      payment_method = PaymentMethod.EFECTIVO,
      receipt_image_url,
      discount_percent = 0,
    } = createOrderDto;

    this.validatePaymentDetails(payment_method, receipt_image_url);
    this.validateDiscountPercent(discount_percent);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar existencia del cliente
      const client = await queryRunner.manager.findOneBy(Client, { id: client_id });
      if (!client) {
        throw new NotFoundException(`El cliente con ID ${client_id} no existe`);
      }

      // 2. Generar el código secuencial (ej: PED-0003)
      const count = await queryRunner.manager.count(Order);
      const nextNumber = (count + 1).toString().padStart(4, '0');
      const code = `PED-${nextNumber}`;

      // 3. Crear la instancia inicial de Order
      const newOrder = queryRunner.manager.create(Order, {
        code,
        client_id,
        seller_id: sellerId,
        notes,
        status: OrderStatus.PENDIENTE,
        total_amount: 0,
        discount_percent,
        payment_method,
        receipt_image_url:
          payment_method === PaymentMethod.TRANSFERENCIA
            ? receipt_image_url!
            : null,
      });

      // Guardar el encabezado para obtener su UUID
      const savedOrder = await queryRunner.manager.save(Order, newOrder);

      let totalAmount = 0;
      const orderItemsToSave: OrderItem[] = [];

      // 4. Validar productos, congelar precios y calcular subtotales
      for (const itemDto of items) {
        const product = await queryRunner.manager.findOneBy(Product, {
          id: itemDto.product_id,
        });

        if (!product) {
          throw new NotFoundException(
            `El producto con ID ${itemDto.product_id} no existe`,
          );
        }

        if (!product.is_active) {
          throw new BadRequestException(
            `El producto "${product.name}" está desactivado actualmente`,
          );
        }

        const unitPrice = Number(product.price);
        const subtotal = unitPrice * itemDto.quantity;
        totalAmount += subtotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          order_id: savedOrder.id,
          product_id: product.id,
          quantity: itemDto.quantity,
          unit_price: unitPrice,
          subtotal,
        });

        orderItemsToSave.push(orderItem);
      }

      // 5. Guardar los ítems del pedido
      await queryRunner.manager.save(OrderItem, orderItemsToSave);

      // 6. Aplicar el descuento seleccionado y guardar los importes finales.
      savedOrder.discount_amount = this.calculateDiscount(
        totalAmount,
        discount_percent,
      );
      savedOrder.total_amount = totalAmount - savedOrder.discount_amount;
      await queryRunner.manager.save(Order, savedOrder);

      // Commit de la transacción SQL
      await queryRunner.commitTransaction();

      const createdOrder = await this.findOne(savedOrder.id);
      
      // 1. Emitir evento por WebSockets
      this.notificationsGateway.emitOrderCreated(createdOrder);
      
      // 2. Enviar notificación Push mediante Firebase FCM (si existe un token configurado)
      const adminFcmToken = process.env.ADMIN_FCM_TOKEN;
      if (adminFcmToken) {
        await this.firebaseService.sendPushNotification(
          adminFcmToken,
          '¡Nuevo Pedido Creado!',
          `Se ha registrado el pedido ${createdOrder.code} por $${createdOrder.total_amount}`,
          { orderId: createdOrder.id },
        );
      }

      // Devolver la orden con sus relaciones cargadas
      return createdOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al procesar la transacción del pedido',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Consulta pedidos aplicando el aislamiento de roles:
   * ADMIN ve todos; VENDEDOR ve únicamente los creados por él.
   */
  async findAll(user: User, status?: OrderStatus): Promise<Order[]> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.client', 'client')
      .leftJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .orderBy('order.created_at', 'DESC');

    // Filtro por rol
    if (user.role === UserRole.VENDEDOR) {
      queryBuilder.andWhere('order.seller_id = :sellerId', { sellerId: user.id });
    }

    // Filtro por estado opcional
    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    const orders = await queryBuilder.getMany();
    return orders.map((order) => this.hideRemovedOrderItems(order));
  }

/**
   * Busca un pedido específico cargando sus detalles.
   */
  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        client: true,
        seller: true,
        items: {
          product: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return this.hideRemovedOrderItems(order);
  }

  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
    user: User,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
      }
      order.items = await queryRunner.manager.find(OrderItem, {
        where: { order_id: order.id },
      });
      if (
        order.status !== OrderStatus.PENDIENTE &&
        order.status !== OrderStatus.EN_PREPARACION
      ) {
        throw new BadRequestException(
          'Solo se pueden editar pedidos pendientes o en preparación.',
        );
      }
      if (
        order.status === OrderStatus.EN_PREPARACION &&
        user.role !== UserRole.ADMIN
      ) {
        throw new ForbiddenException(
          'Solo ADMIN puede editar un pedido en preparación porque modifica el inventario.',
        );
      }
      if (user.role !== UserRole.ADMIN && order.seller_id !== user.id) {
        throw new ForbiddenException(
          'No puedes editar una orden de otro vendedor',
        );
      }

      const client = await queryRunner.manager.findOneBy(Client, {
        id: updateOrderDto.client_id,
      });
      if (!client) {
        throw new NotFoundException(
          `El cliente con ID ${updateOrderDto.client_id} no existe`,
        );
      }

      const requestedQuantities = new Map<string, number>();
      for (const itemDto of updateOrderDto.items) {
        requestedQuantities.set(
          itemDto.product_id,
          (requestedQuantities.get(itemDto.product_id) ?? 0) + itemDto.quantity,
        );
      }

      const productIds = [...new Set([
        ...order.items.map((item) => item.product_id),
        ...requestedQuantities.keys(),
      ])].sort();
      const products = new Map<string, Product>();
      for (const productId of productIds) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: productId },
          ...(order.status === OrderStatus.EN_PREPARACION
            ? { lock: { mode: 'pessimistic_write' as const } }
            : {}),
        });
        if (!product) {
          throw new NotFoundException(
            `El producto con ID ${productId} no existe`,
          );
        }
        products.set(productId, product);
      }

      let totalAmount = 0;
      const orderItemsToSave: OrderItem[] = [];
      const productIdsToUpdate = new Set([
        ...order.items.map((item) => item.product_id),
        ...requestedQuantities.keys(),
      ]);

      for (const productId of productIdsToUpdate) {
        const product = products.get(productId)!;
        const existingItems = order.items.filter(
          (item) => item.product_id === productId,
        );
        const currentQuantity = existingItems.reduce(
          (total, item) => total + item.quantity,
          0,
        );
        const requestedQuantity = requestedQuantities.get(productId) ?? 0;
        if (!product.is_active && requestedQuantity > currentQuantity) {
          throw new BadRequestException(
            `El producto "${product.name}" está desactivado actualmente`,
          );
        }

        let orderItem = existingItems[0];
        if (!orderItem && requestedQuantity > 0) {
          orderItem = queryRunner.manager.create(OrderItem, {
            order_id: order.id,
            product_id: product.id,
            quantity: 0,
            unit_price: Number(product.price),
            subtotal: 0,
          });
          if (order.status === OrderStatus.EN_PREPARACION) {
            orderItem = await queryRunner.manager.save(OrderItem, orderItem);
          }
        }

        if (order.status === OrderStatus.EN_PREPARACION) {
          const quantityDelta = requestedQuantity - currentQuantity;
          if (quantityDelta !== 0) {
            if (!orderItem) {
              throw new BadRequestException(
                `No se pudo asociar el ajuste de ${product.name} al pedido.`,
              );
            }
            await this.inventoryService.recordMovement(
              queryRunner.manager,
              product,
              {
                userId: user.id,
                type:
                  quantityDelta > 0
                    ? InventoryMovementType.SALIDA
                    : InventoryMovementType.ENTRADA,
                reason:
                  quantityDelta > 0
                    ? InventoryMovementReason.VENTA
                    : InventoryMovementReason.AJUSTE_PEDIDO,
                quantity: Math.abs(quantityDelta),
                notes: `Ajuste de cantidad del pedido ${order.code}`,
                orderId: order.id,
                orderItemId: orderItem.id,
              },
            );
          }
        }

        if (orderItem) {
          const extraItems = existingItems.slice(1);
          orderItem.quantity = requestedQuantity;
          orderItem.subtotal = Number(orderItem.unit_price) * requestedQuantity;
          orderItemsToSave.push(orderItem, ...extraItems.map((item) => {
            item.quantity = 0;
            item.subtotal = 0;
            return item;
          }));
          totalAmount += orderItem.subtotal;
        }
      }

      await queryRunner.manager.save(OrderItem, orderItemsToSave);
      const paymentMethod =
        updateOrderDto.payment_method ?? order.payment_method;
      const receiptImageUrl =
        updateOrderDto.receipt_image_url ?? order.receipt_image_url;
      const discountPercent =
        updateOrderDto.discount_percent ?? order.discount_percent;
      this.validatePaymentDetails(paymentMethod, receiptImageUrl);
      this.validateDiscountPercent(discountPercent);
      const discountAmount = this.calculateDiscount(totalAmount, discountPercent);

      await queryRunner.manager.update(Order, order.id, {
        client_id: updateOrderDto.client_id,
        notes: updateOrderDto.notes?.trim() || '',
        payment_method: paymentMethod,
        receipt_image_url:
          paymentMethod === PaymentMethod.TRANSFERENCIA
            ? receiptImageUrl
            : null,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        total_amount: totalAmount - discountAmount,
      });

      await queryRunner.commitTransaction();
      return this.findOne(order.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el pedido');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Actualiza el flujo de estado de la orden (Restringido a ADMIN).
   */
  async updateStatus(id: string, status: OrderStatus, user: User): Promise<Order> {
    return this.changeStatus(id, status, user.id);
  }

  async produceAndPrepare(
    id: string,
    dto: ProduceOrderDto,
    user: User,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
      }
      order.items = await queryRunner.manager.find(OrderItem, {
        where: { order_id: order.id },
      });
      order.items = order.items.filter((item) => item.quantity > 0);
      if (order.status !== OrderStatus.PENDIENTE) {
        throw new BadRequestException(
          'Solo se puede producir y preparar un pedido pendiente.',
        );
      }

      const orderItemsById = new Map(order.items.map((item) => [item.id, item]));
      const productions = [...dto.items].sort((a, b) =>
        (orderItemsById.get(a.order_item_id)?.product_id ?? '').localeCompare(
          orderItemsById.get(b.order_item_id)?.product_id ?? '',
        ),
      );
      const productionItemIds = new Set(productions.map((item) => item.order_item_id));
      if (productionItemIds.size !== productions.length) {
        throw new BadRequestException(
          'No repitas un ítem de pedido; combina las cantidades en una sola línea.',
        );
      }
      const lockedProducts = new Map<string, Product>();

      const productsToLock = [...new Set(order.items.map((item) => item.product_id))].sort();
      for (const productId of productsToLock) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: productId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!product) {
          throw new NotFoundException(`Producto con ID ${productId} no encontrado`);
        }
        lockedProducts.set(productId, product);
      }

      for (const production of productions) {
        const orderItem = orderItemsById.get(production.order_item_id);
        if (!orderItem) {
          throw new BadRequestException(
            `El ítem ${production.order_item_id} no pertenece al pedido.`,
          );
        }
        const product = lockedProducts.get(orderItem.product_id);
        if (!product) {
          throw new NotFoundException(
            `Producto con ID ${orderItem.product_id} no encontrado`,
          );
        }
        lockedProducts.set(product.id, product);
        await this.inventoryService.recordMovement(
          queryRunner.manager,
          product,
          {
            userId: user.id,
            type: InventoryMovementType.ENTRADA,
            reason: InventoryMovementReason.PRODUCCION,
            quantity: production.quantity,
            notes: `Producción para pedido ${order.code}`,
            orderId: order.id,
            orderItemId: orderItem.id,
          },
        );
      }

      await this.consumeOrderStock(queryRunner.manager, order, user.id, lockedProducts);
      order.status = OrderStatus.EN_PREPARACION;
      await queryRunner.manager.save(Order, order);
      await queryRunner.commitTransaction();
      return this.findOne(order.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al registrar la producción y preparar el pedido',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async changeStatus(
    id: string,
    status: OrderStatus,
    userId: string,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
      }
      order.items = await queryRunner.manager.find(OrderItem, {
        where: { order_id: order.id },
      });
      if (order.status === status) {
        await queryRunner.commitTransaction();
        return this.findOne(order.id);
      }

      if (
        (order.status === OrderStatus.PENDIENTE &&
          status === OrderStatus.EN_PREPARACION) ||
        (order.status === OrderStatus.EN_PREPARACION &&
          status === OrderStatus.ENTREGADO)
      ) {
        if (status === OrderStatus.EN_PREPARACION) {
          await this.consumeOrderStock(queryRunner.manager, order, userId);
        }
      } else if (
        status === OrderStatus.CANCELADO &&
        (order.status === OrderStatus.PENDIENTE ||
          order.status === OrderStatus.EN_PREPARACION)
      ) {
        if (order.status === OrderStatus.EN_PREPARACION) {
          await this.restoreOrderStock(queryRunner.manager, order, userId);
        }
      } else {
        throw new BadRequestException(
          `No se permite cambiar el pedido de ${order.status} a ${status}.`,
        );
      }

      order.status = status;
      await queryRunner.manager.save(Order, order);
      await queryRunner.commitTransaction();
      return this.findOne(order.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el estado del pedido');
    } finally {
      await queryRunner.release();
    }
  }

  private async consumeOrderStock(
    manager: EntityManager,
    order: Order,
    userId: string,
    knownProducts = new Map<string, Product>(),
  ): Promise<void> {
    const items = order.items.filter((item) => item.quantity > 0).sort((a, b) =>
      a.product_id.localeCompare(b.product_id),
    );
    const products = new Map<string, Product>();

    for (const item of items) {
      let product = knownProducts.get(item.product_id);
      if (!product) {
        product = await manager.findOne(Product, {
          where: { id: item.product_id },
          lock: { mode: 'pessimistic_write' },
        }) ?? undefined;
      }
      if (!product) {
        throw new NotFoundException(`Producto con ID ${item.product_id} no encontrado`);
      }
      products.set(item.product_id, product);
    }

    const requiredByProduct = new Map<string, number>();
    for (const item of items) {
      requiredByProduct.set(
        item.product_id,
        (requiredByProduct.get(item.product_id) ?? 0) + item.quantity,
      );
    }
    for (const [productId, required] of requiredByProduct) {
      const product = products.get(productId)!;
      if (product.stock_quantity < required) {
        throw new BadRequestException(
          `No se puede preparar el pedido ${order.code}: Stock insuficiente de ${product.name} (Requeridos: ${required}, Disponibles: ${product.stock_quantity}).`,
        );
      }
    }

    for (const item of items) {
      await this.inventoryService.recordMovement(
        manager,
        products.get(item.product_id)!,
        {
          userId,
          type: InventoryMovementType.SALIDA,
          reason: InventoryMovementReason.VENTA,
          quantity: item.quantity,
          notes: `Venta del pedido ${order.code}`,
          orderId: order.id,
          orderItemId: item.id,
        },
      );
    }
  }

  private async restoreOrderStock(
    manager: EntityManager,
    order: Order,
    userId: string,
  ): Promise<void> {
    const items = order.items.filter((item) => item.quantity > 0).sort((a, b) =>
      a.product_id.localeCompare(b.product_id),
    );
    for (const item of items) {
      const product = await manager.findOne(Product, {
        where: { id: item.product_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product) {
        throw new NotFoundException(`Producto con ID ${item.product_id} no encontrado`);
      }
      await this.inventoryService.recordMovement(manager, product, {
        userId,
        type: InventoryMovementType.ENTRADA,
        reason: InventoryMovementReason.CANCELACION_PEDIDO,
        quantity: item.quantity,
        notes: `Reversa por cancelación del pedido ${order.code}`,
        orderId: order.id,
        orderItemId: item.id,
      });
    }
  }

  private hideRemovedOrderItems(order: Order): Order {
    order.items = order.items.filter((item) => item.quantity > 0);
    return order;
  }
}