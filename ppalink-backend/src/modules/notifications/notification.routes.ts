import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { getMyMessageNotificationsHandler, getMyNotificationsHandler, markAllAsReadHandler, markOneAsReadHandler } from './notification.controller';

const router = Router();
router.use(authenticate);

// GET /api/notifications (for generic)
router.get('/', getMyNotificationsHandler);
// GET /api/notifications/messages
router.get('/messages', getMyMessageNotificationsHandler);
// POST /api/notifications/read (marks all of a type as read)
router.post('/read', markAllAsReadHandler);
// POST /api/notifications/:notificationId/read
router.post('/:notificationId/read', markOneAsReadHandler);

export default router;