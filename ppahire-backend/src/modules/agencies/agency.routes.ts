import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import jobRoutes from '../jobs/job.routes'; // Import the nested job routes
import { getAgencyProfileHandler, updateAgencyProfileHandler } from './agency.controller';
import { updateAgencyProfileSchema } from './agency.types';
const router = Router();
// All routes below require the user to be an authenticated AGENCY user
router.use(authenticate, requireRole([Role.AGENCY]));
// Agency Profile Routes
// GET /api/agencies/:agencyId/profile
router.get('/:agencyId/profile', getAgencyProfileHandler);
// PUT /api/agencies/:agencyId/profile
router.put('/:agencyId/profile', validate(updateAgencyProfileSchema), updateAgencyProfileHandler);
// Nest Job Routes under the agency
// This will handle all routes defined in job.routes.ts under /api/agencies/:agencyId/jobs
router.use('/:agencyId/jobs', jobRoutes);
export default router;