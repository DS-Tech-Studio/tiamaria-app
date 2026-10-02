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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { access, mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, User } from '../users/entities/user.entity';
import { ProduceOrderDto } from './dto/produce-order.dto';

interface UploadedReceipt {
  buffer: Buffer;
  mimetype: string;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('receipts')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
          callback(
            new BadRequestException('Adjunta una imagen JPG, PNG o WEBP.'),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadReceipt(@UploadedFile() file?: UploadedReceipt) {
    if (!file) {
      throw new BadRequestException('Debes adjuntar una imagen de comprobante.');
    }

    const extensionByMimeType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const filename = `${randomUUID()}.${extensionByMimeType[file.mimetype]}`;
    const receiptDirectory = join(process.cwd(), 'uploads', 'receipts');
    await mkdir(receiptDirectory, { recursive: true });
    await writeFile(join(receiptDirectory, filename), file.buffer);

    return { receipt_image_url: `/orders/receipts/${filename}` };
  }

  @Get('receipts/:filename')
  async getReceipt(@Param('filename') filename: string): Promise<StreamableFile> {
    if (!/^[0-9a-f-]+\.(jpg|png|webp)$/.test(filename)) {
      throw new BadRequestException('Nombre de comprobante no válido.');
    }
    const receiptPath = join(process.cwd(), 'uploads', 'receipts', filename);
    try {
      await access(receiptPath);
    } catch {
      throw new BadRequestException('No se encontró el comprobante.');
    }

    const contentType = filename.endsWith('.png')
      ? 'image/png'
      : filename.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';
    return new StreamableFile(createReadStream(receiptPath), {
      type: contentType,
      disposition: 'inline',
    });
  }

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