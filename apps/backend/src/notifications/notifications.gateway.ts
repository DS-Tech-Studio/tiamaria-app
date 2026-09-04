import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Order } from '../modules/orders/entities/order.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado a WebSockets: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  /**
   * Transmite el evento 'order:created' a todos los clientes conectados (pantallas del Admin)
   */
  emitOrderCreated(order: Order) {
    this.server.emit('order:created', {
      message: '¡Nuevo pedido registrado!',
      order,
    });
  }
}