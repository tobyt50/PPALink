import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { getCandidateProfileByUserId } from '../candidates/candidate.service';
import * as experienceService from './experience.service';

// Helper remains the same
async function getProfileId(userId: string) {
  const profile = await getCandidateProfileByUserId(userId);
  if (!profile) throw new Error('Candidate profile not found.');
  return profile.id;
}

// --- Work Experience Handlers ---
export async function addWorkExperienceHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const profileId = await getProfileId(req.user.id);
    // The body is now guaranteed to be valid by the middleware
    const experience = await experienceService.addWorkExperience(profileId, req.body);
    res.status(201).json({ success: true, data: experience });
  } catch (error) { next(error); }
}

export async function updateWorkExperienceHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { experienceId } = req.params;
    // The body is now guaranteed to be valid by the middleware
    const experience = await experienceService.updateWorkExperience(experienceId, req.body);
    res.status(200).json({ success: true, data: experience });
  } catch (error) { next(error); }
}

export async function deleteWorkExperienceHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { experienceId } = req.params;
    await experienceService.deleteWorkExperience(experienceId);
    res.status(204).send();
  } catch (error) { next(error); }
}


// --- Education Handlers ---
export async function addEducationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const profileId = await getProfileId(req.user.id);
    // The body is now guaranteed to be valid by the middleware
    const education = await experienceService.addEducation(profileId, req.body);
    res.status(201).json({ success: true, data: education });
  } catch (error) { next(error); }
}

export async function updateEducationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { educationId } = req.params;
    // The body is now guaranteed to be valid by the middleware
    const education = await experienceService.updateEducation(educationId, req.body);
    res.status(200).json({ success: true, data: education });
  } catch (error) { next(error); }
}

export async function deleteEducationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { educationId } = req.params;
    await experienceService.deleteEducation(educationId);
    res.status(204).send();
  } catch (error) { next(error); }
}