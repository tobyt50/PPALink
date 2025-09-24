import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import verificationRoutes from '../verifications/verification.routes';
import { getAllUsersHandler, updateUserStatusHandler, getAdminDashboardAnalyticsHandler, getAdminTimeSeriesAnalyticsHandler, getUserDetailsHandler, getJobsForAgencyUserHandler, getApplicationsForCandidateUserHandler, sendSystemMessageHandler, impersonateUserHandler, getAllJobsHandler, adminUpdateJobHandler, adminUnpublishJobHandler, adminRepublishJobHandler, adminGetJobByIdHandler } from './admin.controller';
import { forceVerifyEmailHandler, forceVerifyNyscHandler, forceVerifyDomainHandler, forceVerifyCacHandler,
} from './verification.controller';
import { getActivityLogForUserHandler } from '../activity/activity.controller';
import { getAllPlansHandler, createPlanHandler, updatePlanHandler, deletePlanHandler, } from './plan.controller';

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

// GET /api/admin/analytics/timeseries
router.get('/analytics/timeseries', getAdminTimeSeriesAnalyticsHandler);

// GET /api/admin/users/:userId
router.get('/users/:userId', getUserDetailsHandler);

// POST /api/admin/users/:userId/force-verify-email
router.post('/users/:userId/force-verify-email', forceVerifyEmailHandler);

// POST /api/admin/users/:userId/force-verify-nysc
router.post('/users/:userId/force-verify-nysc', forceVerifyNyscHandler);

// POST /api/admin/users/:userId/force-verify-domain
router.post('/users/:userId/force-verify-domain', forceVerifyDomainHandler);

// POST /api/admin/users/:userId/force-verify-cac
router.post('/users/:userId/force-verify-cac', forceVerifyCacHandler);

// GET /api/admin/users/:userId/activity
router.get('/users/:userId/activity', getActivityLogForUserHandler);

// GET /api/admin/users/:userId/jobs
router.get('/users/:userId/jobs', getJobsForAgencyUserHandler);

// GET /api/admin/users/:userId/applications
router.get('/users/:userId/applications', getApplicationsForCandidateUserHandler);

// POST /api/admin/users/:userId/send-message
router.post('/users/:userId/send-message', sendSystemMessageHandler);

// POST /api/admin/users/:userId/impersonate
router.post('/users/:userId/impersonate', impersonateUserHandler);

// GET /api/admin/jobs
router.get('/jobs', getAllJobsHandler);

// PATCH /api/admin/jobs/:jobId
router.patch('/jobs/:jobId', adminUpdateJobHandler);

// POST /api/admin/jobs/:jobId/unpublish
router.post('/jobs/:jobId/unpublish', adminUnpublishJobHandler);

// POST /api/admin/jobs/:jobId/republish
router.post('/jobs/:jobId/republish', adminRepublishJobHandler);

// GET /api/admin/jobs/:jobId
router.get('/jobs/:jobId', adminGetJobByIdHandler);

// SUBSCRIPTION PLAN MANAGEMENT ROUTES
const planRouter = Router();
planRouter.get('/', getAllPlansHandler);
planRouter.post('/', createPlanHandler);
planRouter.patch('/:planId', updatePlanHandler);
planRouter.delete('/:planId', deletePlanHandler);

router.use('/plans', planRouter);

export default router;