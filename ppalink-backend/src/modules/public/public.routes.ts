import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { getSubscriptionPlansHandler } from '../billing/billing.controller';
import { acceptInvitationSignUpHandler, verifyInvitationTokenHandler } from '../invitations/invitation.controller';
import { getPublicJobByIdHandler, getPublicJobsHandler } from '../jobs/job.controller';
import { finalizeDomainVerificationHandler } from '../verifications/domain.controller';

const router = Router();

// GET /api/public/plans
router.get('/plans', getSubscriptionPlansHandler);

// This route is protected and can only be accessed by authenticated CANDIDATES
// GET /api/public/jobs
router.get('/jobs', authenticate, requireRole([Role.CANDIDATE]), getPublicJobsHandler);

// GET /api/public/jobs/:jobId
router.get('/jobs/:jobId', getPublicJobByIdHandler);

// GET /api/public/invitations/verify/:token
router.get('/invitations/verify/:token', verifyInvitationTokenHandler);

// POST /api/public/invitations/accept
router.post('/invitations/accept', acceptInvitationSignUpHandler);

// POST /api/public/verify-domain-token
router.post('/verify-domain-token', finalizeDomainVerificationHandler);

export default router;