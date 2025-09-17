import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from './notification.service';

// HANDLER to fetch all notifications
export async function getMyNotificationsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const notifications = await getNotifications(req.user.id, 'GENERIC');
    res.status(200).json({ success: true, data: notifications });
  } catch (error) { next(error); }
}

// HANDLER to fetch only message notifications
export async function getMyMessageNotificationsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const notifications = await getNotifications(req.user.id, 'MESSAGE');
    res.status(200).json({ success: true, data: notifications });
  } catch (error) { next(error); }
}

// HANDLER to be more specific
export async function markAllAsReadHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const { type } = req.body; // Pass type to mark as read
    await markAllNotificationsAsRead(req.user.id, type);
    res.status(200).json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) { next(error); }
}

/**
 * Handler to mark a single notification as read.
 */
export async function markOneAsReadHandler(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const { notificationId } = req.params;
        await markNotificationAsRead(notificationId, req.user.id);
        res.status(200).json({ success: true, message: 'Notification marked as read.' });
    } catch (error) { next(error); }
}