import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { checkAgencyMembership } from '../agencies/agency.service';
import * as JobService from './job.service';
import { CreateJobPositionInput, UpdateJobPositionInput } from './job.types';

// Controller to create a new job
export async function createJobHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { agencyId } = req.params;
    const userId = req.user!.id;
    const data: CreateJobPositionInput = req.body;

    await checkAgencyMembership(userId, agencyId);

    const job = await JobService.createJobPosition(agencyId, data);
    return res.status(201).json({ success: true, data: job });
  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
        return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// Controller to get all jobs for an agency
export async function getAgencyJobsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { agencyId } = req.params;
    const jobs = await JobService.getJobsByAgencyId(agencyId);
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler to get the details of a single job post.
 */
export async function getJobDetailsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { agencyId, jobId } = req.params;

    // Although the service layer checks for ownership, it's good practice
    // to also verify membership for consistency, especially for CUD operations.
    // For a simple GET, this could be considered optional but adds a layer of security.
    if (req.user) {
        await checkAgencyMembership(req.user.id, agencyId);
    }

    const job = await JobService.getJobByIdAndAgency(jobId, agencyId);
    return res.status(200).json({ success: true, data: job });
  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message.includes('Job not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// Controller to update a job
export async function updateJobHandler(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { agencyId, jobId } = req.params;
        const userId = req.user!.id;
        const data: UpdateJobPositionInput = req.body;

        await checkAgencyMembership(userId, agencyId);

        const updatedJob = await JobService.updateJobPosition(jobId, agencyId, data);
        return res.status(200).json({ success: true, data: updatedJob });
    } catch (error: any) {
        if (error.message.includes('Forbidden')) {
            return res.status(403).json({ success: false, message: error.message });
        }
        next(error);
    }
}

// Controller to delete a job
export async function deleteJobHandler(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { agencyId, jobId } = req.params;
        const userId = req.user!.id;

        await checkAgencyMembership(userId, agencyId);
        
        await JobService.deleteJobPosition(jobId, agencyId);
        return res.status(204).send(); // 204 No Content for successful deletion
    } catch (error: any) {
        if (error.message.includes('Forbidden')) {
            return res.status(403).json({ success: false, message: error.message });
        }
        next(error);
    }
}