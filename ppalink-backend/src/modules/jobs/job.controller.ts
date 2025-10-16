import { NextFunction, Response, Request } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { checkAgencyMembership, getAgencyByUserId } from '../agencies/agency.service';
import {
  createJobPosition,
  deleteJobPosition,
  getJobByIdAndAgency,
  getJobsByAgencyId,
  getJobWithApplicants,
  getPublicJobById,
  getPublicJobs,
  updateJobPosition,
  queryApplicantsInPipeline,
  exportPipelineToCSV, 
  findSimilarJobs,
  recordJobView,
} from './job.service';
import { CreateJobPositionInput, UpdateJobPositionInput } from './job.types';

// Controller to create a new job
export async function createJobHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { agencyId } = req.params;
    const userId = req.user!.id;
    const data: CreateJobPositionInput = req.body;

    await checkAgencyMembership(userId, agencyId);

    const job = await createJobPosition(agencyId, data);
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
    const jobs = await getJobsByAgencyId(agencyId);
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

    const job = await getJobByIdAndAgency(jobId, agencyId);
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

    const updatedJob = await updateJobPosition(jobId, agencyId, data);
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

    await deleteJobPosition(jobId, agencyId);
    return res.status(204).send(); // 204 No Content for successful deletion
  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Handler to get a single job post along with all its applicants (pipeline).
 */
export async function getJobPipelineHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { agencyId, jobId } = req.params;

    // Security check: ensure the logged-in user is a member of the agency
    if (req.user) {
      await checkAgencyMembership(req.user.id, agencyId);
    }

    const jobWithPipeline = await getJobWithApplicants(jobId, agencyId);

    return res.status(200).json({ success: true, data: jobWithPipeline });
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

/**
 * Handler for fetching all public, open job postings.
 * This is accessible by any authenticated user (e.g., candidates).
 */
export async function getPublicJobsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const jobs = await getPublicJobs(req.query);
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for fetching a single public job by ID.
 * Accessible by any authenticated user.
 */
export async function getPublicJobByIdHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;
    const job = await getPublicJobById(jobId);
    return res.status(200).json({ success: true, data: job });
  } catch (error: any) {
    if (error.message.includes('Job not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

export async function queryApplicantsInPipelineHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;
    // The rich filter object comes from the request body
    const filters = req.body;

    const results = await queryApplicantsInPipeline(jobId, filters);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
}

export async function exportPipelineHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    const { jobId } = req.params;
    const agency = await getAgencyByUserId(req.user.id);
    
    const csvData = await exportPipelineToCSV(jobId, agency.id);

    // 2. Set the correct headers for a CSV file download
    res.header('Content-Type', 'text/csv');
    res.attachment(`pipeline-export-${jobId}.csv`);
    
    // 3. Send the CSV data as the response
    return res.send(csvData);

  } catch (error) {
    next(error);
  }
}

export async function findSimilarJobsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    const { jobId } = req.params;
    const similarJobs = await findSimilarJobs(jobId, req.user.id);
    res.status(200).json({ success: true, data: similarJobs });
  } catch (error) {
    next(error);
  }
}

export async function recordJobViewHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;
    // The user might be null if they are not logged in, which is okay.
    const userId = req.user?.id;
    
    await recordJobView(jobId, userId);
    // Send a 204 No Content response as we don't need to return data
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}