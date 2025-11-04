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

router.get(
  '/:applicationId/candidate',
  authenticate,
  requireRole([Role.CANDIDATE]),
  getApplicationForCandidateHandler
);

router.post(
  '/offers/:offerId/respond',
  authenticate,
  requireRole([Role.CANDIDATE]),
  respondToOfferHandler
);

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

export default router;