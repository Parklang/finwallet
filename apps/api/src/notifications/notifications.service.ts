import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  async findAll(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { notifications, unreadCount };
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async sendNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any,
  ) {
    const notification = await this.prisma.notification.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: { userId, type: type as any, title, message, data },
    });
    // Push via WebSocket
    this.gateway.sendToUser(userId, 'notification', notification);
    return notification;
  }
}
