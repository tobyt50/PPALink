import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { getConversationHandler, getConversationsHandler, sendMessageHandler } from './message.controller';

const router = Router();

// Apply a master authentication guard to all messaging routes.
// Any logged-in user can send/receive messages, so we don't restrict by role here.
router.use(authenticate);

// Validation schema for sending a message
const sendMessageSchema = z.object({
  toId: z.string().uuid('Invalid user ID format.'),
  body: z.string().min(1, 'Message body cannot be empty.'),
});

// GET /api/messages/conversations
router.get('/conversations', getConversationsHandler);

// GET /api/messages/conversation/:otherUserId
router.get('/conversation/:otherUserId', getConversationHandler);

// POST /api/messages
router.post('/', validate(sendMessageSchema), sendMessageHandler);


export default router;