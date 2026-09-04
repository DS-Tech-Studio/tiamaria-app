import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Client } from '../clients/entities/client.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Registra una venta transaccional usando QueryRunner.
   */
  async create(createOrderDto: CreateOrderDto, sellerId: string): Promise<Order> {
    const { client_id, notes, items } = createOrderDto;

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

        if (!product.is_available) {
          throw new BadRequestException(
            `El producto "${product.name}" no está disponible actualmente`,
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

      // 6. Actualizar el total_amount acumulado en la orden
      savedOrder.total_amount = totalAmount;
      await queryRunner.manager.save(Order, savedOrder);

      // Commit de la transacción SQL
      await queryRunner.commitTransaction();

      // Devolver la orden con sus relaciones cargadas
      return await this.findOne(savedOrder.id);
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

    return await queryBuilder.getMany();
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

    return order;
  }

  /**
   * Actualiza el flujo de estado de la orden (Restringido a ADMIN).
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return await this.orderRepository.save(order);
  }
}