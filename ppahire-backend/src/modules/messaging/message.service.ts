import prisma from '../../config/db';

interface SendMessageInput {
  fromId: string; // The ID of the User sending the message
  toId: string;   // The ID of the User receiving the message
  body: string;
  // We can add context later, e.g., applicationId
}

/**
 * Creates a new message record in the database.
 */
export async function sendMessage(data: SendMessageInput) {
  // In a real app, you'd have more complex logic here, e.g., checking if
  // these two users are allowed to communicate (e.g., connected via an application).
  return prisma.message.create({
    data: {
      fromId: data.fromId,
      toId: data.toId,
      body: data.body,
    },
  });
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
    // This is a more advanced Prisma query.
    // 1. Get all messages sent to or from the user.
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ fromId: userId }, { toId: userId }],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        from: { select: { id: true, email: true, candidateProfile: { select: { firstName: true, lastName: true } }, ownedAgencies: { select: { name: true } } } },
        to: { select: { id: true, email: true, candidateProfile: { select: { firstName: true, lastName: true } }, ownedAgencies: { select: { name: true } } } },
      },
    });
  
    // 2. Group messages by the "other user" in the conversation.
    const conversations = new Map<string, { otherUser: any; lastMessage: any }>();
    messages.forEach(msg => {
      const otherUserId = msg.fromId === userId ? msg.toId : msg.fromId;
      const otherUser = msg.fromId === userId ? msg.to : msg.from;
  
      // 3. If we haven't seen this conversation yet, add it with the latest message.
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          otherUser: otherUser,
          lastMessage: msg,
        });
      }
    });
  
    return Array.from(conversations.values());
}