import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { getAgencyByUserId } from '../agencies/agency.service';
import { scheduleInterview } from './interview.service';

/**
 * Handler for an agency to schedule an interview for an application.
 */
export async function scheduleInterviewHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    const { applicationId } = req.params;
    const { scheduledAt, mode, location, details } = req.body;

    // Basic validation
    if (!applicationId || !scheduledAt || !mode) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const agency = await getAgencyByUserId(req.user.id);
    
    const interview = await scheduleInterview({
        applicationId,
        agencyId: agency.id,
        scheduledAt,
        mode,
        location,
        details,
        io: req.app.io,
    });

    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
}