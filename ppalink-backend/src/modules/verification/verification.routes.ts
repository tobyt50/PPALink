import { Router } from 'express';
import { getPendingVerificationsHandler, updateVerificationStatusHandler } from './verification.controller';

const router = Router();

// Note: The main admin router will apply the authenticate and requireRole middleware,
// so we don't need to add it again here.

// GET /api/admin/verifications/pending
router.get('/pending', getPendingVerificationsHandler);

// PATCH /api/admin/verifications/:verificationId/status
router.patch('/:verificationId/status', updateVerificationStatusHandler);

export default router;