import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { createCheckoutSessionHandler, createPortalSessionHandler } from './billing.controller';

const router = Router();

// Billing routes are protected and only accessible by AGENCY users.
router.use(authenticate, requireRole([Role.AGENCY]));

// POST /api/billing/create-checkout-session
router.post('/create-checkout-session', createCheckoutSessionHandler);

// POST /api/billing/create-portal-session
router.post('/create-portal-session', createPortalSessionHandler);

export default router;