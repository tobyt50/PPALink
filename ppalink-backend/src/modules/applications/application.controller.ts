import { ApplicationStatus } from '@prisma/client';
import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { getAgencyByUserId } from '../agencies/agency.service';
import { createApplication, createCandidateApplication, getApplicationDetails, updateApplication, } from './application.service';

/**
 * Handler for an agency to create a new application (add a candidate to a job pipeline).
 */
export async function createApplicationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { positionId, candidateId } = req.body;
    if (!positionId || !candidateId) {
      return res.status(400).json({ success: false, message: 'Position ID and Candidate ID are required.' });
    }

    // Get the agency ID of the logged-in user to ensure security
    const agency = await getAgencyByUserId(req.user.id);

    const application = await createApplication({
      positionId,
      candidateId,
      agencyId: agency.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Candidate added to job pipeline.',
      data: application,
    });
  } catch (error: any) {
     if (error.message.includes('already been added')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Handler to update the status and/or notes of an application.
 */
export async function updateApplicationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body; // 2. Accept both status and notes

    // Basic validation to ensure at least one valid field is being updated
    if (!status && notes === undefined) {
      return res.status(400).json({ success: false, message: 'A valid status or notes field is required.' });
    }
    if (status && !Object.values(ApplicationStatus).includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    const agency = await getAgencyByUserId(req.user.id);
    
    // 3. Pass the data object to the service
    const updatedApplication = await updateApplication(applicationId, agency.id, { status, notes }, req.app.io);

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully.',
      data: updatedApplication,
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Handler for a CANDIDATE to create a new application for a job.
 */
export async function createCandidateApplicationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { positionId } = req.body;
    if (!positionId) {
      return res.status(400).json({ success: false, message: 'Position ID is required.' });
    }

    const application = await createCandidateApplication(positionId, req.user.id);

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: application,
    });
  } catch (error: any) {
    if (error.message.includes('already applied')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Handler for an agency to get the full details of a single application.
 */
export async function getApplicationDetailsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { applicationId } = req.params;
    const agency = await getAgencyByUserId(req.user.id);
    
    const applicationDetails = await getApplicationDetails(applicationId, agency.id);

    return res.status(200).json({ success: true, data: applicationDetails });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}