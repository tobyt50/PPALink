import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { createCandidateApplicationHandler } from '../applications/application.controller';
import experienceRoutes from '../experience/experience.routes';
import { acceptInvitationLoggedInHandler } from '../invitations/invitation.controller';
import { createVerificationSubmissionHandler } from '../verifications/verification.controller';
import {
  getMyApplicationsHandler,
  getMyProfileHandler,
  getPublicCandidateProfileHandler,
  updateMyProfileHandler,
  getCandidateDashboardDataHandler,
  completeOnboardingHandler,
  updateSummaryHandler,
  setSkillsHandler,
  updateCvHandler,
  getRecommendedJobsHandler,
  followAgencyHandler,
  unfollowAgencyHandler,
  getFollowingFeedHandler,
} from './candidate.controller';
import { UpdateCandidateProfileSchema } from './candidate.types';
import { findSimilarJobsHandler, getPublicJobsHandler } from '../jobs/job.controller';

const router = Router();

// --- Sub-router for all routes related to the logged-in candidate ("me") ---
const candidateRouter = Router();
candidateRouter.use(authenticate, requireRole([Role.CANDIDATE]));

// GET /api/candidates/me
candidateRouter.get('/', getMyProfileHandler);

// PUT /api/candidates/me
candidateRouter.put('/', validate(UpdateCandidateProfileSchema), updateMyProfileHandler);

// GET /api/candidates/me/dashboard
candidateRouter.get('/dashboard', getCandidateDashboardDataHandler);

// GET /api/candidates/me/applications
candidateRouter.get('/applications', getMyApplicationsHandler);

// GET /api/candidates/me/jobs
candidateRouter.get('/jobs', getPublicJobsHandler);

// GET /api/candidates/me/recommended-jobs
candidateRouter.get('/recommended-jobs', getRecommendedJobsHandler);

// GET /api/candidates/me/jobs/:jobId/similar
candidateRouter.get('/jobs/:jobId/similar', findSimilarJobsHandler);

// PATCH /api/candidates/me/summary
candidateRouter.patch('/summary', updateSummaryHandler);

// POST /api/candidates/me/complete-onboarding
candidateRouter.post('/complete-onboarding', completeOnboardingHandler);

// PUT /api/candidates/me/skills
candidateRouter.put('/skills', setSkillsHandler);

// PUT /api/candidates/me/cv
candidateRouter.put('/cv', updateCvHandler);

// POST /api/candidates/me/:agencyId/follow
candidateRouter.post('/:agencyId/follow', followAgencyHandler);

// DELETE /api/candidates/me/:agencyId/follow
candidateRouter.delete('/:agencyId/follow', unfollowAgencyHandler);

// GET /api/candidates/me/following-feed
candidateRouter.get('/following-feed', getFollowingFeedHandler);

// Mounts experience routes like POST /api/candidates/me/experience
candidateRouter.use(experienceRoutes);

// Mount the entire sub-router at /api/candidates/me
router.use('/me', candidateRouter);


// --- Other Candidate-related Routes ---

// GET /api/candidates/:candidateId/profile
router.get(
  '/:candidateId/profile', 
  authenticate, 
  requireRole([Role.AGENCY]), 
  getPublicCandidateProfileHandler
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

// POST /api/candidates/invitations/accept
router.post(
  '/invitations/accept',
  authenticate,
  acceptInvitationLoggedInHandler
);

export default router;