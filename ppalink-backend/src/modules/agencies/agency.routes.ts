import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import invitationRoutes from '../invitations/invitation.routes';
import jobRoutes from '../jobs/job.routes'; // Import the nested job routes
import { getAgencyProfileHandler, getMyAgencyHandler, getShortlistedCandidatesHandler, removeShortlistHandler, searchCandidatesHandler, shortlistCandidateHandler, updateAgencyProfileHandler, updateMyAgencyHandler, completeOnboardingHandler, getInterviewPipelineHandler, issueWorkVerificationHandler } from './agency.controller';
import { updateAgencyProfileSchema } from './agency.types';
import { getAgencyAnalyticsHandler, getAgencyDashboardDataHandler } from '../analytics/analytics.controller';
import { initiateDomainVerificationHandler } from '../verifications/domain.controller';
import { createVerificationSubmissionHandler } from '../verifications/verification.controller';
import { queryApplicantsInPipelineHandler } from '../jobs/job.controller';
import { getMyPostsHandler } from '../feed/feed.controller';
import { updateLogoHandler } from './agency.controller';

const router = Router();
// All routes below require the user to be an authenticated AGENCY user
router.use(authenticate, requireRole([Role.AGENCY]));
// Agency Profile Routes
router.put('/me', validate(updateAgencyProfileSchema), updateMyAgencyHandler);
router.get('/me', getMyAgencyHandler);

// GET /api/agencies/search/candidates?stateId=25&skills=javascript
router.get('/search/candidates', searchCandidatesHandler);

// GET /api/agencies/:agencyId/profile
router.get('/:agencyId/profile', getAgencyProfileHandler);
// PUT /api/agencies/:agencyId/profile
router.put('/:agencyId/profile', validate(updateAgencyProfileSchema), updateAgencyProfileHandler);
// Nest Job Routes under the agency
// This will handle all routes defined in job.routes.ts under /api/agencies/:agencyId/jobs
router.use('/:agencyId/jobs', jobRoutes);

// POST /api/agencies/shortlist
router.post('/shortlist', shortlistCandidateHandler);

// GET /api/agencies/shortlist
router.get('/shortlist', getShortlistedCandidatesHandler);

// DELETE /api/agencies/shortlist/:candidateId
router.delete('/shortlist/:candidateId', removeShortlistHandler);

// This will create routes like POST /api/agencies/invitations
router.use('/invitations', invitationRoutes);

// GET /api/agencies/analytics
router.get('/analytics', getAgencyAnalyticsHandler);

// GET /api/agencies/dashboard
router.get('/dashboard', getAgencyDashboardDataHandler);

// POST /api/agencies/verify-domain
router.post('/verify-domain', initiateDomainVerificationHandler);

// POST /api/agencies/verifications
router.post('/verifications', createVerificationSubmissionHandler);

// POST /api/agencies/complete-onboarding
router.post('/complete-onboarding', completeOnboardingHandler);

// POST /api/agencies/:agencyId/jobs/:jobId/pipeline/query
router.post('/:agencyId/jobs/:jobId/pipeline/query', queryApplicantsInPipelineHandler);

// GET /api/agencies/me/interviews
router.get('/interviews', getInterviewPipelineHandler);

// POST /api/agencies/work-experience/:workExperienceId/verify
router.post('/work-experience/:workExperienceId/verify', issueWorkVerificationHandler);

// GET /api/agencies/me/feed
router.get('/feed', getMyPostsHandler);

// PATCH /api/agencies/me/logo
router.patch('/logo', updateLogoHandler);

export default router;