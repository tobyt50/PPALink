import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { getPresignedDownloadUrlHandler, getPresignedUrlHandler } from './upload.controller';

const router = Router();

// This route is protected. Only logged-in users can request an upload URL.
// We are not restricting by role here, as both Candidates and Agencies might upload files (e.g., logos).
router.use(authenticate);

// POST /api/uploads/presigned-url
router.post('/presigned-url', getPresignedUrlHandler);

// POST /api/uploads/download-url
router.post('/download-url', getPresignedDownloadUrlHandler);

export default router;