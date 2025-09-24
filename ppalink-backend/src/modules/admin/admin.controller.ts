import { UserStatus } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { getAdminDashboardAnalytics, getAllUsers, updateUserStatus, sendSystemMessage, adminUpdateJob, adminUnpublishJob, adminRepublishJob, adminGetJobById } from './admin.service';
import { getAdminTimeSeriesAnalytics, getUserDetails, getJobsForAgencyUser, getApplicationsForCandidateUser, getAllJobs } from './admin.service';
import { generateImpersonationToken } from '../auth/auth.service';
import { AuthRequest } from '../../middleware/auth';

/**
 * Handler for an admin to get a list of all users.
 */
export async function getAllUsersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await getAllUsers(req.query);
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

/**
 * Handler for fetching time-series analytics for the admin dashboard charts.
 */
export async function getAdminTimeSeriesAnalyticsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const timeSeriesData = await getAdminTimeSeriesAnalytics();
    res.status(200).json({ success: true, data: timeSeriesData });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for fetching the details of a single user.
 */
export async function getUserDetailsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const userDetails = await getUserDetails(userId);
    res.status(200).json({ success: true, data: userDetails });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Handler for fetching jobs posted by a specific agency user.
 */
export async function getJobsForAgencyUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const jobs = await getJobsForAgencyUser(userId);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for fetching applications submitted by a specific candidate user.
 */
export async function getApplicationsForCandidateUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const applications = await getApplicationsForCandidateUser(userId);
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
}

export async function sendSystemMessageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message body is required.' });
    }
    await sendSystemMessage(userId, message);
    res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for an admin to initiate a user impersonation session.
 */
export async function impersonateUserHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const { userId: targetUserId } = req.params;
    const adminUserId = req.user.id;

    if (targetUserId === adminUserId) {
      return res.status(400).json({ success: false, message: "You cannot impersonate yourself." });
    }

    const { token, user } = await generateImpersonationToken(targetUserId, adminUserId);
    
    // Return both the token and the user object to the frontend
    res.status(200).json({ success: true, data: { token, user } });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Handler for fetching all job postings on the platform.
 */
export async function getAllJobsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const jobs = await getAllJobs(req.query);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateJobHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;
    const updatedJob = await adminUpdateJob(jobId, req.body);
    res.status(200).json({ success: true, data: updatedJob, message: 'Job updated successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function adminUnpublishJobHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;
    await adminUnpublishJob(jobId);
    res.status(200).json({ success: true, message: 'Job has been unpublished.' });
  } catch (error) {
    next(error);
  }
}

export async function adminRepublishJobHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;
    await adminRepublishJob(jobId);
    res.status(200).json({ success: true, message: 'Job has been republished.' });
  } catch (error) {
    next(error);
  }
}

export async function adminGetJobByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;
    const job = await adminGetJobById(jobId);
    res.status(200).json({ success: true, data: job });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}