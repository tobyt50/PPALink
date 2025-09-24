import type { NextFunction, Request, Response } from 'express';
import { getActivityLogForUser } from './activity.service';

/**
 * Handler for fetching the activity log for a specific user.
 */
export async function getActivityLogForUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const activityLog = await getActivityLogForUser(userId);
    res.status(200).json({ success: true, data: activityLog });
  } catch (error) {
    next(error);
  }
}