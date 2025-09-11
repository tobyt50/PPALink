import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { getConversation, getConversations, sendMessage } from './message.service';

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

    const message = await sendMessage({
      fromId: req.user.id,
      toId,
      body,
    });
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