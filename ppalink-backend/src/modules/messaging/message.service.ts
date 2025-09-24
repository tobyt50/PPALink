import type { User } from '@prisma/client';
import { NotificationType } from '@prisma/client';
import type { Server } from 'socket.io';
import prisma from '../../config/db';
import { onlineUsers } from '../../config/socket';
import { createNotification } from '../notifications/notification.service';
import env from '../../config/env';

interface SendMessageInput {
  fromId: string;
  toId: string;
  body: string;
  fromUser: Pick<User, 'id'> & { 
    candidateProfile?: { firstName: string | null; lastName: string | null; } | null; 
    ownedAgencies?: { name: string }[] 
  };
}

/**
 * Creates a new message record in the database.
 */
export async function sendMessage(data: SendMessageInput, io: Server) {
  const newMessage = await prisma.message.create({
    data: {
      fromId: data.fromId,
      toId: data.toId,
      body: data.body,
    },
  });

  const recipientSocketId = onlineUsers.get(data.toId);

  if (recipientSocketId) {
    io.to(recipientSocketId).emit('new_message', newMessage);
  }

  let senderName = 'A user'; // Default fallback

  if (data.fromId === env.SYSTEM_USER_ID) {
    senderName = 'PPALink Support';
  } else if (data.fromUser.ownedAgencies && data.fromUser.ownedAgencies.length > 0) {
    senderName = data.fromUser.ownedAgencies[0].name;
  } else if (data.fromUser.candidateProfile?.firstName && data.fromUser.candidateProfile?.lastName) {
    senderName = `${data.fromUser.candidateProfile.firstName} ${data.fromUser.candidateProfile.lastName}`;
  }
  await createNotification(
    {
      userId: data.toId,
      message: `You have a new message from ${senderName}`,
      link: `/inbox?with=${data.fromId}`,
      type: NotificationType.MESSAGE,
      meta: {
        lastMessage: data.body,
      }
    },
    io
  );
  return newMessage;
}

/**
 * Fetches the conversation thread between two users.
 */
export async function getConversation(userOneId: string, userTwoId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { fromId: userOneId, toId: userTwoId },
        { fromId: userTwoId, toId: userOneId },
      ],
    },
    orderBy: {
      createdAt: 'asc', // Show messages in chronological order
    },
    include: {
        from: { select: { id: true, role: true } }, // Include sender info
        to: { select: { id: true, role: true } }, // Include receiver info
    }
  });
}

/**
 * Fetches the inbox view for a user.
 * This involves finding the last message for each unique conversation partner.
 */
export async function getConversations(userId: string) {
  // This query is now more complex to also fetch the latest message body
  const conversations = await prisma.user.findMany({
      where: {
          OR: [
              { messagesSent: { some: { toId: userId } } },
              { messagesReceived: { some: { fromId: userId } } },
          ],
          NOT: { id: userId }
      },
      select: {
          id: true,
          email: true,
          candidateProfile: { select: { firstName: true, lastName: true } },
          ownedAgencies: { select: { name: true } },
          messagesSent: {
              where: { toId: userId },
              orderBy: { createdAt: 'desc' },
              take: 1,
          },
          messagesReceived: {
              where: { fromId: userId },
              orderBy: { createdAt: 'desc' },
              take: 1,
          }
      }
  });

  // Process the results to create the Conversation[] structure
  const processedConversations = conversations.map(user => {
      const lastSent = user.messagesReceived[0];
      const lastReceived = user.messagesSent[0];
      const lastMessage = (!lastSent || (lastReceived && lastReceived.createdAt > lastSent.createdAt)) ? lastReceived : lastSent;
      
      // Sanitize the other user object
      const otherUser = {
          id: user.id,
          email: user.email,
          candidateProfile: user.candidateProfile,
          ownedAgencies: user.ownedAgencies,
      };

      return { otherUser, lastMessage };
  }).sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());

  return processedConversations;
}

/**
 * Marks all messages in a conversation as read by a specific user.
 * @param readerId The ID of the user who is reading the messages.
 * @param otherUserId The ID of the other user in the conversation.
 */
export async function markConversationAsRead(readerId: string, otherUserId: string, io: Server) {
  const messagesToUpdate = await prisma.message.findMany({
    where: {
      fromId: otherUserId,
      toId: readerId,
      readAt: null,
    },
    select: {
      id: true, // We only need their IDs
    },
  });
  if (messagesToUpdate.length === 0) {
    return;
  }

  const messageIdsToUpdate = messagesToUpdate.map(msg => msg.id);

  await prisma.message.updateMany({
    where: {
      id: {
        in: messageIdsToUpdate,
      },
    },
    data: {
      readAt: new Date(),
    },
  });

  // 3. Emit a more specific event with the IDs of the messages that were just updated.
  const readerSocketId = onlineUsers.get(readerId);
  const otherUserSocketId = onlineUsers.get(otherUserId);
  const conversationUsers = [readerSocketId, otherUserSocketId].filter(Boolean) as string[];

  if (conversationUsers.length > 0) {
    io.to(conversationUsers).emit('messages_read', {
      conversationPartnerId: otherUserId,
      readMessageIds: messageIdsToUpdate,
    });
  }
}