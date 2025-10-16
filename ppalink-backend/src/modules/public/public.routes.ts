import { Router } from 'express';
import { getSubscriptionPlansHandler } from '../billing/billing.controller';
import { acceptInvitationSignUpHandler, verifyInvitationTokenHandler } from '../invitations/invitation.controller';
import { getPublicJobByIdHandler, recordJobViewHandler } from '../jobs/job.controller';
import { finalizeDomainVerificationHandler } from '../verifications/domain.controller';
import { getPublicAgencyProfileHandler, getFeaturedAgenciesHandler } from '../agencies/agency.controller';
import { authenticateOptional } from '../../middleware/auth';

const router = Router();

// GET /api/public/plans
router.get('/plans', getSubscriptionPlansHandler);

// GET /api/public/jobs/:jobId
router.get('/jobs/:jobId', getPublicJobByIdHandler);

// GET /api/public/invitations/verify/:token
router.get('/invitations/verify/:token', verifyInvitationTokenHandler);

// POST /api/public/invitations/accept
router.post('/invitations/accept', acceptInvitationSignUpHandler);

// POST /api/public/verify-domain-token
router.post('/verify-domain-token', finalizeDomainVerificationHandler);

// GET /api/public/agencies/:agencyId/profile
router.get('/agencies/:agencyId/profile', getPublicAgencyProfileHandler);

// GET /api/public/featured-agencies
router.get('/featured-agencies', getFeaturedAgenciesHandler);

// POST /api/public/jobs/:jobId/view
router.post('/jobs/:jobId/view', authenticateOptional, recordJobViewHandler);

export default router;