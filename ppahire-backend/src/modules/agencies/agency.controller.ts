import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { checkAgencyMembership, getAgencyById, getAgencyByUserId, getShortlistedCandidates, removeShortlist, searchCandidates, shortlistCandidate, updateAgencyProfile } from './agency.service';
import { UpdateAgencyProfileInput } from './agency.types';

export async function getAgencyProfileHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { agencyId } = req.params;
    // Any authenticated user can view an agency profile, so no membership check here.
    const agency = await getAgencyById(agencyId);
    return res.status(200).json({ success: true, data: agency });
  } catch (error) {
    next(error);
  }
}

export async function getMyAgencyHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const agency = await getAgencyByUserId(req.user.id);
    return res.status(200).json({ success: true, data: agency });
  } catch (error) {
    next(error);
  }
}

export async function updateAgencyProfileHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { agencyId } = req.params;
    const userId = req.user!.id;
    const data: UpdateAgencyProfileInput = req.body;

    // Security Check: Ensure user is an Owner or Manager
    await checkAgencyMembership(userId, agencyId);

    const updatedAgency = await updateAgencyProfile(agencyId, data);
    return res.status(200).json({
      success: true,
      message: 'Agency profile updated successfully',
      data: updatedAgency,
    });
  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
        return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
}

export async function updateMyAgencyHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const agency = await getAgencyByUserId(req.user.id);
    const updatedAgency = await updateAgencyProfile(agency.id, req.body);
    
    return res.status(200).json({
        success: true,
        message: 'Agency profile updated successfully',
        data: updatedAgency
    });
  } catch (error) {
    next(error);
  }
}

export async function searchCandidatesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // We can extract search and filter criteria from the query string
    const queryParams = req.query;

    // In the next step, our service will contain the logic to process these queries
    const candidates = await searchCandidates(queryParams);
    
    return res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for an agency to shortlist a candidate.
 */
export async function shortlistCandidateHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { candidateId } = req.body; // Candidate's profile ID from the request body
    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required.' });
    }

    // Get the agency ID associated with the logged-in user
    const agency = await getAgencyByUserId(req.user.id);
    
    const shortlistEntry = await shortlistCandidate(agency.id, candidateId);

    return res.status(201).json({
      success: true,
      message: 'Candidate shortlisted successfully.',
      data: shortlistEntry,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for an agency to get their list of shortlisted candidates.
 */
export async function getShortlistedCandidatesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    // Get the agency ID associated with the logged-in user
    const agency = await getAgencyByUserId(req.user.id);
    
    const candidates = await getShortlistedCandidates(agency.id);

    return res.status(200).json({
      success: true,
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for an agency to remove a candidate from their shortlist.
 */
export async function removeShortlistHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { candidateId } = req.params; // Get ID from URL parameter now
    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required.' });
    }

    const agency = await getAgencyByUserId(req.user.id);
    
    await removeShortlist(agency.id, candidateId);

    return res.status(200).json({
      success: true,
      message: 'Candidate removed from shortlist.',
    });
  } catch (error) {
    next(error);
  }
}