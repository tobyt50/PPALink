import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { createJobHandler, deleteJobHandler, exportPipelineHandler, getAgencyJobsHandler, getJobDetailsHandler, getJobPipelineHandler, updateJobHandler } from './job.controller';
import { createJobPositionSchema, updateJobPositionSchema } from './job.types';

const router = Router({ mergeParams: true }); // mergeParams is essential for nested routes

// POST /api/agencies/:agencyId/jobs
router.post('/', validate(createJobPositionSchema), createJobHandler);

// GET /api/agencies/:agencyId/jobs
router.get('/', getAgencyJobsHandler);

router.get('/:jobId', getJobDetailsHandler);

// PUT /api/agencies/:agencyId/jobs/:jobId
router.put('/:jobId', validate(updateJobPositionSchema), updateJobHandler);

// DELETE /api/agencies/:agencyId/jobs/:jobId
router.delete('/:jobId', deleteJobHandler);

// GET /api/agencies/:agencyId/jobs/:jobId/pipeline
router.get('/:jobId/pipeline', getJobPipelineHandler);

// GET /api/agencies/:agencyId/jobs/:jobId/pipeline/export
router.get('/:jobId/pipeline/export', exportPipelineHandler);

export default router;