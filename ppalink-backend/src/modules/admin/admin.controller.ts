import { UserStatus } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { getAdminDashboardAnalytics, getAllUsers, updateUserStatus } from './admin.service';

/**
 * Handler for an admin to get a list of all users.
 */
export async function getAllUsersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await getAllUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for an admin to update a user's status.
 */
export async function updateUserStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    // Validate the incoming status
    if (!status || !Object.values(UserStatus).includes(status)) {
      return res.status(400).json({ success: false, message: 'A valid user status is required.' });
    }

    const updatedUser = await updateUserStatus(userId, status);

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}.`,
      data: updatedUser,
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
     if (error.message.includes('Cannot change the status of an admin')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Handler for fetching admin dashboard analytics.
 */
export async function getAdminDashboardAnalyticsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const analytics = await getAdminDashboardAnalytics();
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
}