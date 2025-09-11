import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { createApplicationHandler, getApplicationDetailsHandler, updateApplicationHandler, } from './application.controller';

const router = Router();

// --- Agency-specific Application Routes ---
const agencyRouter = Router();
agencyRouter.use(authenticate, requireRole([Role.AGENCY]));
agencyRouter.post('/', createApplicationHandler);
agencyRouter.patch('/:applicationId', updateApplicationHandler);

// GET /api/applications/:applicationId
agencyRouter.get('/:applicationId', getApplicationDetailsHandler);


// --- Candidate-specific Application Routes ---
const candidateRouter = Router();

// --- Mount sub-routers ---
router.use(agencyRouter);
router.use(candidateRouter);

export default router;