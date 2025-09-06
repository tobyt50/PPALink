import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth'; // Import our custom request type
import { getCandidateProfileById, getCandidateProfileByUserId, updateCandidateProfile } from './candidate.service';
import { UpdateCandidateProfileInput } from './candidate.types';

/**
 * Handler to get the profile of the currently authenticated user.
 */
export async function getMyProfileHandler(req: AuthRequest, res: Response, next: NextFunction) {
  // req.user is populated by the 'authenticate' middleware
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const profile = await getCandidateProfileByUserId(req.user.id);
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler to update the profile of the currently authenticated user.
 */
export async function updateMyProfileHandler(
  req: AuthRequest, // Use AuthRequest here
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const data: UpdateCandidateProfileInput = req.body;

  try {
    const updatedProfile = await updateCandidateProfile(req.user.id, data);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicCandidateProfileHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { candidateId } = req.params;
    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required.' });
    }

    const profile = await getCandidateProfileById(candidateId);
    
    // In a future step, you could add logic here to hide sensitive info if needed
    
    return res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}