import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { getPublicJobByIdHandler, getPublicJobsHandler } from '../jobs/job.controller';

const router = Router();

// This route is protected and can only be accessed by authenticated CANDIDATES
// GET /api/public/jobs
router.get('/jobs', authenticate, requireRole([Role.CANDIDATE]), getPublicJobsHandler);

// GET /api/public/jobs/:jobId
router.get('/jobs/:jobId', getPublicJobByIdHandler);

export default router;