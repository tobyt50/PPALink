import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { getMyProfileHandler, getPublicCandidateProfileHandler, updateMyProfileHandler } from './candidate.controller';
import { UpdateCandidateProfileSchema } from './candidate.types';

const router = Router();

// --- Routes for the logged-in candidate's own profile ---
// Middleware is now applied directly to the routes.
router.get(
  '/me', 
  authenticate, 
  requireRole([Role.CANDIDATE]), 
  getMyProfileHandler
);
router.put(
  '/me', 
  authenticate, 
  requireRole([Role.CANDIDATE]), 
  validate(UpdateCandidateProfileSchema), 
  updateMyProfileHandler
);

// --- Route for an agency to view a candidate's profile ---
// This route now has its own, separate middleware chain.
router.get(
  '/:candidateId/profile', 
  authenticate, 
  requireRole([Role.AGENCY]), 
  getPublicCandidateProfileHandler
);

export default router;