// ============================================================
// NOTIFICATIONS — Section 11: Realtime via Socket.io
// ============================================================
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/notifications' })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);
  private userSocketMap = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId as string | undefined;
    if (userId) {
      this.userSocketMap.set(userId, client.id);
      void client.join(`user:${userId}`);
      this.logger.log(`User ${userId} connected`);
    }
  }

  handleDisconnect(client: Socket) {
    this.userSocketMap.forEach((socketId, userId) => {
      if (socketId === client.id) this.userSocketMap.delete(userId);
    });
  }

  sendToUser(userId: string, event: string, data: Record<string, unknown>) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    client.emit('pong', { timestamp: new Date() });
  }
}
