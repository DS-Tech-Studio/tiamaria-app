import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, User } from '../users/entities/user.entity';
import { ProduceOrderDto } from './dto/produce-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: { user: User }) {
    const sellerId = req.user.id;
    return this.ordersService.create(createOrderDto, sellerId);
  }

  @Get()
  findAll(
    @Req() req: { user: User },
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findAll(req.user, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: { user: User },
  ) {
    return this.ordersService.updateOrder(id, updateOrderDto, req.user);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Req() req: { user: User },
  ) {
    return this.ordersService.updateStatus(
      id,
      updateOrderStatusDto.status,
      req.user,
    );
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/produce-and-prepare')
  produceAndPrepare(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProduceOrderDto,
    @Req() req: { user: User },
  ): Promise<Order> {
    return this.ordersService.produceAndPrepare(id, dto, req.user);
  }
}