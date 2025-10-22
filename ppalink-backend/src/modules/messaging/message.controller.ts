import type { NextFunction, Response } from 'express';
import prisma from '../../config/db';
import type { AuthRequest } from '../../middleware/auth';
import { getConversation, getConversations, markConversationAsRead, sendMessage } from './message.service';

/**
 * Handler for sending a new message.
 */
export async function sendMessageHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const { toId, body } = req.body;
    if (!toId || !body) {
      return res.status(400).json({ success: false, message: 'toId and body are required.' });
    }

    const fromUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        candidateProfile: { select: { firstName: true, lastName: true } },
        ownedAgencies: { select: { name: true } },
      }
    });

    if (!fromUser) {
        throw new Error('Sender not found.');
    }

    // 2. Pass the user object and the io instance to the service
    const message = await sendMessage({
      fromId: req.user.id,
      toId,
      body,
      fromUser
    }, req.app.io);

    res.status(201).json({ success: true, data: message });
  } catch (error) { next(error); }
}

/**
 * Handler for fetching a conversation with another user.
 */
export async function getConversationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const { otherUserId } = req.params;
    if (!otherUserId) {
      return res.status(400).json({ success: false, message: 'Other user ID is required.' });
    }

    const messages = await getConversation(req.user.id, otherUserId);
    res.status(200).json({ success: true, data: messages });
  } catch (error) { next(error); }
}

/**
 * Handler for fetching all of a user's conversations (inbox view).
 */
export async function getConversationsHandler(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const conversations = await getConversations(req.user.id);
      res.status(200).json({ success: true, data: conversations });
    } catch (error) { next(error); }
}

/**
 * Handler for a user to mark a conversation as read.
 */
export async function markAsReadHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const { otherUserId } = req.params;
    await markConversationAsRead(req.user.id, otherUserId, req.app.io);
    res.status(200).json({ success: true, message: 'Messages marked as read.' });
  } catch (error) { next(error); }
}

/**
 * Handler for fetching user details for initiating a new conversation.
 */
export async function getUserForConversationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        avatarKey: true,
        ownedAgencies: { select: { id: true, name: true, logoKey: true } },
        candidateProfile: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
}