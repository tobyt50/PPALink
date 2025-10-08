import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import {
  createApplicationHandler,
  getApplicationDetailsHandler,
  updateApplicationHandler,
  deleteApplicationHandler,
  getApplicationForCandidateHandler,
} from './application.controller';
import { scheduleInterviewHandler } from '../interviews/interview.controller';
import { createOfferHandler, respondToOfferHandler } from '../offers/offer.controller';

const router = Router();

// --- THIS IS THE DEFINITIVE FIX ---
// The route definition now PERFECTLY matches the URL the frontend is calling.
// The `:applicationId` parameter comes FIRST, followed by the static `/candidate` segment.
// This is the most specific route and must be defined before the generic `/:applicationId`.

router.get(
  '/:applicationId/candidate', // CORRECTED ROUTE
  authenticate,
  requireRole([Role.CANDIDATE]),
  getApplicationForCandidateHandler
);

// --- Candidate Offer Response Route ---
// This also needs to be specific.
router.post(
  '/offers/:offerId/respond', // We can adjust the frontend to call this if needed
  authenticate,
  requireRole([Role.CANDIDATE]),
  respondToOfferHandler
);


// --- Agency Routes ---
router.post(
  '/',
  authenticate,
  requireRole([Role.AGENCY]),
  createApplicationHandler
);

router.post(
  '/:applicationId/interviews',
  authenticate,
  requireRole([Role.AGENCY]),
  scheduleInterviewHandler
);

router.post(
  '/:applicationId/offers',
  authenticate,
  requireRole([Role.AGENCY]),
  createOfferHandler
);

// --- Generic Agency Routes with :applicationId (Defined LAST) ---
router.get(
  '/:applicationId',
  authenticate,
  requireRole([Role.AGENCY]),
  getApplicationDetailsHandler
);

router.patch(
  '/:applicationId',
  authenticate,
  requireRole([Role.AGENCY]),
  updateApplicationHandler
);

router.delete(
  '/:applicationId',
  authenticate,
  requireRole([Role.AGENCY]),
  deleteApplicationHandler
);
// --- END OF FIX ---

export default router;