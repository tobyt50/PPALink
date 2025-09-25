import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import verificationRoutes from '../verifications/verification.routes';
import { getAllUsersHandler, updateUserStatusHandler, getAdminDashboardAnalyticsHandler, getAdminTimeSeriesAnalyticsHandler, getUserDetailsHandler, getJobsForAgencyUserHandler, getApplicationsForCandidateUserHandler, sendSystemMessageHandler, impersonateUserHandler, getAllJobsHandler, adminUpdateJobHandler, adminUnpublishJobHandler, adminRepublishJobHandler, adminGetJobByIdHandler, createAdminPortalSessionHandler, getAllAdminsHandler, createAdminHandler, deleteAdminHandler, updateAdminRoleHandler } from './admin.controller';
import { forceVerifyEmailHandler, forceVerifyNyscHandler, forceVerifyDomainHandler, forceVerifyCacHandler,
} from './verification.controller';
import { getActivityLogForUserHandler } from '../activity/activity.controller';
import { getAllPlansHandler, createPlanHandler, updatePlanHandler, deletePlanHandler, } from './plan.controller';
import { getAllSettingsHandler, updateSettingsHandler, getAllFeatureFlagsHandler, updateFeatureFlagHandler, } from './settings.controller';
import { userGrowthReportHandler, applicationFunnelReportHandler, candidateInsightsReportHandler, agencyInsightsReportHandler, jobMarketInsightsReportHandler } from '../analytics/reporting.controller';
import { reportFiltersSchema } from '../analytics/reporting.types'; // 1. Import the schema
import { validate } from '../../middleware/validate';
import { exportAuditLogsHandler, getAuditLogsHandler, getAuditLogByIdHandler } from '../auditing/audit.controller';

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

// POST /api/admin/subscriptions/create-portal-session
router.post('/subscriptions/create-portal-session', createAdminPortalSessionHandler);

// SUBSCRIPTION PLAN MANAGEMENT ROUTES
const planRouter = Router();
planRouter.get('/', getAllPlansHandler);
planRouter.post('/', createPlanHandler);
planRouter.patch('/:planId', updatePlanHandler);
planRouter.delete('/:planId', deletePlanHandler);

router.use('/plans', planRouter);

// SETTINGS AND FEATURE FLAG ROUTES
const settingsRouter = Router();
settingsRouter.get('/', getAllSettingsHandler);
settingsRouter.patch('/', updateSettingsHandler); // Use PATCH for updates
router.use('/settings', settingsRouter);

const featureFlagRouter = Router();
featureFlagRouter.get('/', getAllFeatureFlagsHandler);
featureFlagRouter.patch('/:flagName', updateFeatureFlagHandler);
router.use('/feature-flags', featureFlagRouter);

// POST /api/admin/reports/user-growth
router.post('/reports/user-growth', validate(reportFiltersSchema), userGrowthReportHandler);

// POST /api/admin/reports/application-funnel
router.post('/reports/application-funnel', validate(reportFiltersSchema), applicationFunnelReportHandler);

// POST /api/admin/reports/candidate-insights
router.post('/reports/candidate-insights', validate(reportFiltersSchema), candidateInsightsReportHandler);

// POST /api/admin/reports/agency-insights
router.post('/reports/agency-insights', validate(reportFiltersSchema), agencyInsightsReportHandler);

// POST /api/admin/reports/job-market-insights
router.post('/reports/job-market-insights', validate(reportFiltersSchema), jobMarketInsightsReportHandler);

// GET /api/admin/audit-logs
router.get('/audit-logs', getAuditLogsHandler);

// GET /api/admin/audit-logs/export
router.get('/audit-logs/export', exportAuditLogsHandler);

// GET /api/admin/audit-logs/:logId
router.get('/audit-logs/:logId', getAuditLogByIdHandler);

const superAdminRouter = Router();
superAdminRouter.use(requireRole([Role.SUPER_ADMIN]));

// GET /api/admin/admins
superAdminRouter.get('/', getAllAdminsHandler);

// POST /api/admin/admins
superAdminRouter.post('/', createAdminHandler);

// PATCH /api/admin/admins/:userId/role
superAdminRouter.patch('/:userId/role', updateAdminRoleHandler);

// DELETE /api/admin/admins/:userId
superAdminRouter.delete('/:userId', deleteAdminHandler);

// Mount the sub-router at /api/admin/admins
router.use('/admins', superAdminRouter);

export default router;