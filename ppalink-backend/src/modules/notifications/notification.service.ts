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
      } else if (data.type === 'NEW_QUIZ') {
        io.to(recipientSocketId).emit('new_quiz_notification', notification);
      }
      else {
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

/**
 * Fetches the count of unread notifications for a user, grouped by type.
 * @param userId The ID of the user.
 */
export async function getUnreadNotificationStatus(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return {};
  
  const counts = await prisma.notification.groupBy({
    by: ['type'],
    where: {
      userId: userId,
      read: false,
    },
    _count: {
      _all: true,
    },
  });

  // Convert the array of groups into a simple key-value object
  const status = counts.reduce((acc, group) => {
    acc[group.type] = group._count._all;
    return acc;
  }, {} as Record<NotificationType, number>);

  if (user.role === 'CANDIDATE') {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
    if (profile) {
        // Find all skills the candidate has on their profile
        const candidateSkills = await prisma.candidateSkill.findMany({
            where: { candidateId: profile.id },
            select: { skillId: true }
        });
        const candidateSkillIds = candidateSkills.map(s => s.skillId);

        // Find all skills they have already verified by passing a quiz
        const verifiedSkillAttempts = await prisma.quizAttempt.findMany({
            where: { candidateId: profile.id, passed: true, skillId: { not: null } },
            select: { skillId: true }
        });
        const verifiedSkillIds = new Set(verifiedSkillAttempts.map(a => a.skillId));

        // Find the skills that are on their profile but NOT yet verified
        const unverifiedSkillIds = candidateSkillIds.filter(id => !verifiedSkillIds.has(id));

        // Count how many of those unverified skills have an official quiz available
        const verifiableCount = await prisma.quiz.count({
            where: {
                skillId: { in: unverifiedSkillIds }
            }
        });
        
        status.NEW_QUIZ = verifiableCount;
    }
  }

  return status;
}