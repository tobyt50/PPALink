import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { getAgencyByUserId } from '../agencies/agency.service';
import { getAgencyAnalytics, getAgencyDashboardData } from './analytics.service';

/**
 * Handler for fetching analytics for the logged-in agency.
 */
export async function getAgencyAnalyticsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const agency = await getAgencyByUserId(req.user.id);
    const analytics = await getAgencyAnalytics(agency.id);
    return res.status(200).json({ success: true, data: analytics });
  } catch (error: any) {
    // Handle the specific error for users on the Free plan
    if (error.message.includes('not available on the Free plan')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
}

export async function getAgencyDashboardDataHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const agency = await getAgencyByUserId(req.user.id);
    const dashboardData = await getAgencyDashboardData(agency.id);
    return res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    next(error);
  }
}