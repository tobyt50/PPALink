import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import verificationRoutes from '../verifications/verification.routes';
import { getAllUsersHandler, updateUserStatusHandler, getAdminDashboardAnalyticsHandler } from './admin.controller';

const router = Router();

// This is a master guard for the entire admin module.
// Every route defined here will require the user to be an authenticated ADMIN.
router.use(authenticate, requireRole([Role.ADMIN]));

// GET /api/admin/analytics
router.get('/analytics', getAdminDashboardAnalyticsHandler);

// GET /api/admin/users
router.get('/users', getAllUsersHandler);

// This will create routes like /api/admin/verifications/pending
router.use('/verifications', verificationRoutes)

// PATCH /api/admin/users/:userId/status
router.patch('/users/:userId/status', updateUserStatusHandler);

export default router;