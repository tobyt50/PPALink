import { NotificationType, Prisma } from '@prisma/client';
import type { Server } from 'socket.io';
import prisma from '../../config/db';
import { onlineUsers } from '../../config/socket';

interface CreateNotificationInput {
  userId: string;
  message: string;
  link?: string;
  type: NotificationType;
  meta?: Prisma.JsonObject;
}

/**
 * Creates a new notification in the database and emits a real-time event.
 * @param data - The data for the new notification.
 * @param io - The Socket.IO server instance.
 */
export async function createNotification(data: CreateNotificationInput, io: Server) {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      message: data.message,
      link: data.link,
      type: data.type,
      meta: data.meta || undefined,
    },
  });

  const recipientSocketId = onlineUsers.get(data.userId);

  if (recipientSocketId) {
      if (data.type === 'MESSAGE') {
        io.to(recipientSocketId).emit('new_message_notification', notification);
    } else {
        io.to(recipientSocketId).emit('new_notification', notification);
    }
  }

  return notification;
}

/**
 * Fetches all recent notifications for a specific user.
 */
export async function getNotifications(userId: string, type?: NotificationType) {
  return prisma.notification.findMany({
    where: {
      userId: userId,
      type: type,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });
}

/**
 * Marks a single notification as read.
 * @param notificationId The ID of the notification to update.
 * @param userId The ID of the user who owns the notification (for security).
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: userId,
    },
    data: {
      read: true,
    },
  });
}

/**
 * Marks all of a user's unread notifications as read.
 */
export async function markAllNotificationsAsRead(userId: string, type?: NotificationType) {
  return prisma.notification.updateMany({
    where: {
      userId: userId,
      type: type,
      read: false,
    },
    data: {
      read: true,
    },
  });
}