import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createCandidateApplicationHandler } from '../applications/application.controller';
import experienceRoutes from '../experience/experience.routes';
import { acceptInvitationLoggedInHandler } from '../invitations/invitation.controller';
import { createVerificationSubmissionHandler } from '../verifications/verification.controller';
import { getMyApplicationsHandler, getMyProfileHandler, getPublicCandidateProfileHandler, updateMyProfileHandler, getCandidateDashboardDataHandler, completeOnboardingHandler, updateSummaryHandler, setSkillsHandler, updateCvHandler, getRecommendedJobsHandler } from './candidate.controller';
import { UpdateCandidateProfileSchema } from './candidate.types';
import { findSimilarJobsHandler } from '../jobs/job.controller';

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

router.get(
  '/me/applications',
  authenticate,
  requireRole([Role.CANDIDATE]),
  getMyApplicationsHandler
);

// POST /api/candidates/verifications
router.post(
  '/verifications',
  authenticate,
  requireRole([Role.CANDIDATE]),
  createVerificationSubmissionHandler
);

// POST /api/candidates/applications/apply
router.post(
  '/applications/apply',
  authenticate,
  requireRole([Role.CANDIDATE]),
  createCandidateApplicationHandler
);

// --- Route for an agency to view a candidate's profile ---
// This route now has its own, separate middleware chain.
router.get(
  '/:candidateId/profile', 
  authenticate, 
  requireRole([Role.AGENCY]), 
  getPublicCandidateProfileHandler
);

// This route is guarded only by `authenticate`, allowing any logged-in user to attempt it.
// The handler will perform the role-specific logic.
// POST /api/candidates/invitations/accept
router.post(
  '/invitations/accept',
  authenticate,
  acceptInvitationLoggedInHandler
);

// GET /api/candidates/me/dashboard
router.get(
  '/me/dashboard', 
  authenticate, 
  requireRole([Role.CANDIDATE]), 
  getCandidateDashboardDataHandler
);

// PATCH /api/candidates/me/summary
router.patch(
  '/me/summary', 
  authenticate, 
  requireRole([Role.CANDIDATE]),
  updateSummaryHandler
);

// POST /api/candidates/me/complete-onboarding
router.post(
  '/me/complete-onboarding', 
  authenticate, 
  requireRole([Role.CANDIDATE]),
  completeOnboardingHandler
);

// PUT /api/candidates/me/skills (PUT is appropriate for replacing a resource)
router.put(
  '/me/skills', 
  authenticate, 
  requireRole([Role.CANDIDATE]),
  setSkillsHandler
);

// PUT /api/candidates/me/cv
router.put(
  '/me/cv', 
  authenticate, 
  requireRole([Role.CANDIDATE]),
  updateCvHandler
);

// GET /api/candidates/me/recommended-jobs
router.get('/me/recommended-jobs', 
  authenticate, 
  requireRole([Role.CANDIDATE]),
  getRecommendedJobsHandler
);

router.get('/me/jobs/:jobId/similar', 
  authenticate, 
  requireRole([Role.CANDIDATE]),
  findSimilarJobsHandler
);

// This will create routes like /api/candidates/me/experience
router.use('/me', authenticate, requireRole([Role.CANDIDATE]), experienceRoutes);

export default router;