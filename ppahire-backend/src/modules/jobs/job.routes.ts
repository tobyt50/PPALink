import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { createJobHandler, deleteJobHandler, getAgencyJobsHandler, updateJobHandler } from './job.controller';
import { createJobPositionSchema, updateJobPositionSchema } from './job.types';

const router = Router({ mergeParams: true }); // mergeParams is essential for nested routes

// POST /api/agencies/:agencyId/jobs
router.post('/', validate(createJobPositionSchema), createJobHandler);

// GET /api/agencies/:agencyId/jobs
router.get('/', getAgencyJobsHandler);

// PUT /api/agencies/:agencyId/jobs/:jobId
router.put('/:jobId', validate(updateJobPositionSchema), updateJobHandler);

// DELETE /api/agencies/:agencyId/jobs/:jobId
router.delete('/:jobId', deleteJobHandler);

export default router;