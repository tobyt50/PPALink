import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts & Guards
import ProtectedRoute from './ProtectedRoute';
import PublicLayout from './PublicLayout';
import RoleBasedLayout from './RoleBasedLayout';

// Page Imports (assuming these paths are correct)
import AdminDashboard from '../pages/admin/Dashboard';
import ManageUsersPage from '../pages/admin/ManageUsers';
import UserDetailsPage from '../pages/admin/UserDetails';
import ManageJobsPage from '../pages/admin/ManageJobs';
import AdminJobDetailsPage from '../pages/admin/AdminJobDetails';
import AdminEditJobPage from '../pages/admin/EditJob';
import ManagePlansPage from '../pages/admin/ManagePlans';
import SettingsPage from '../pages/admin/Settings';
import ReportingPage from '../pages/admin/Reporting';
import VerificationDetailsPage from '../pages/admin/VerificationDetails';
import VerificationQueuePage from '../pages/admin/VerificationQueue';
import AuditLogsPage from '../pages/admin/AuditLogs';
import AuditLogDetailsPage from '../pages/admin/AuditLogDetails';
import BillingPage from '../pages/agencies/Billing';
import BrowseCandidatesPage from '../pages/agencies/BrowseCandidates';
import CompanyProfilePage from '../pages/agencies/CompanyProfile';
import CreateJobPage from '../pages/agencies/CreateJob';
import AgencyDashboard from '../pages/agencies/Dashboard';
import EditCompanyProfilePage from '../pages/agencies/EditCompanyProfile';
import EditJobPage from '../pages/agencies/EditJob';
import JobPostsPage from '../pages/agencies/JobPosts';
import ShortlistedCandidatesPage from '../pages/agencies/ShortlistedCandidates';
import TeamManagementPage from '../pages/agencies/TeamManagement';
import AnalyticsPage from '../pages/agencies/Analytics';
import ApplicationDetailsPage from '../pages/applications/ApplicationDetails';
import AcceptInvitePage from '../pages/auth/AcceptInvite';
import AcceptInviteLoggedInPage from '../pages/auth/AcceptInviteLoggedIn';
import VerifyDomainPage from '../pages/agencies/VerifyDomain';
import DomainVerificationResultPage from '../pages/agencies/DomainVerificationResult';
import ForgotPasswordPage from '../pages/auth/ForgotPassword';
import HandleInvitePage from '../pages/auth/HandleInvite';
import Login from '../pages/auth/Login';
import RegisterAgency from '../pages/auth/RegisterAgency';
import RegisterCandidate from '../pages/auth/RegisterCandidate';
import ResetPasswordPage from '../pages/auth/ResetPassword';
import BrowseJobsPage from '../pages/candidates/BrowseJobs';
import CandidateDashboard from '../pages/candidates/Dashboard';
import EditProfilePage from '../pages/candidates/EditProfile';
import MyApplicationsPage from '../pages/candidates/MyApplications';
import CandidateProfilePage from '../pages/candidates/Profile';
import PublicProfilePage from '../pages/candidates/PublicProfile';
import SubmitVerificationPage from '../pages/candidates/SubmitVerification';
import JobDetailsPage from '../pages/jobs/JobDetails';
import JobPipelinePage from '../pages/jobs/JobPipeline';
import PublicJobDetailsPage from '../pages/jobs/PublicJobDetails';
import LandingPage from '../pages/Landing';
import InboxPage from '../pages/messaging/Inbox';
import AboutPage from '../pages/misc/About';
import TermsPage from '../pages/misc/Terms';
import PrivacyPolicyPage from '../pages/misc/Privacy';

const router = createBrowserRouter([
  // --- Group 1: Public Routes (Unchanged) ---
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <Login /> },
      { path: 'register/candidate', element: <RegisterCandidate /> },
      { path: 'register/agency', element: <RegisterAgency /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'handle-invite', element: <HandleInvitePage /> },
      { path: 'accept-invite', element: <AcceptInvitePage /> },
      { path: 'accept-invite-authenticated', element: <AcceptInviteLoggedInPage /> },
      { path: 'verify-domain', element: <VerifyDomainPage /> },
      { path: 'domain-verified', element: <DomainVerificationResultPage /> }, // Corrected path
      { path: 'about', element: <AboutPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPolicyPage /> },
    ],
  },
  
  // --- Group 2: All Authenticated Routes ---
  {
    path: '/',
    element: <ProtectedRoute />, // The master guard for all children
    children: [
      // Sub-Group for pages using the standard DashboardLayout or AdminLayout
      {
        element: <RoleBasedLayout />,
        children: [
          // Candidate Dashboard Routes
          { path: 'dashboard/candidate', element: <CandidateDashboard /> },
          { path: 'dashboard/candidate/profile', element: <CandidateProfilePage /> },
          { path: 'dashboard/candidate/profile/edit', element: <EditProfilePage /> },
          { path: 'dashboard/candidate/applications', element: <MyApplicationsPage /> },
          { path: 'dashboard/candidate/verifications/submit', element: <SubmitVerificationPage /> },
          { path: 'dashboard/candidate/jobs/browse', element: <BrowseJobsPage /> },

          // Agency Dashboard Routes
          { path: 'dashboard/agency', element: <AgencyDashboard /> },
          { path: 'dashboard/agency/profile', element: <CompanyProfilePage /> },
          { path: 'dashboard/agency/profile/edit', element: <EditCompanyProfilePage /> },
          { path: 'dashboard/agency/billing', element: <BillingPage /> },
          { path: 'dashboard/agency/team', element: <TeamManagementPage /> },
          { path: 'dashboard/agency/analytics', element: <AnalyticsPage /> },
          { path: 'dashboard/agency/jobs', element: <JobPostsPage /> },
          { path: 'dashboard/agency/jobs/create', element: <CreateJobPage /> },
          { path: 'dashboard/agency/:agencyId/jobs/:jobId/edit', element: <EditJobPage /> },
          { path: 'dashboard/agency/:agencyId/jobs/:jobId', element: <JobDetailsPage /> },
          { path: 'dashboard/agency/:agencyId/jobs/:jobId/pipeline', element: <JobPipelinePage /> },
          { path: 'dashboard/agency/candidates/browse', element: <BrowseCandidatesPage /> },
          { path: 'dashboard/agency/candidates/shortlisted', element: <ShortlistedCandidatesPage /> },
          { path: 'dashboard/agency/candidates/:candidateId/profile', element: <PublicProfilePage /> },
          { path: 'dashboard/agency/applications/:applicationId', element: <ApplicationDetailsPage /> },
          
          // Admin Dashboard Routes
          { path: 'admin/dashboard', element: <AdminDashboard /> },
          { path: 'admin/users', element: <ManageUsersPage /> },
          { path: 'admin/users/:userId', element: <UserDetailsPage /> },
          { path: 'admin/jobs', element: <ManageJobsPage /> },
          { path: 'admin/jobs/:jobId', element: <AdminJobDetailsPage /> },
          { path: 'admin/jobs/:jobId/edit', element: <AdminEditJobPage /> },
          { path: 'admin/plans', element: <ManagePlansPage /> },
          { path: 'admin/settings', element: <SettingsPage /> },
          { path: 'admin/reports', element: <ReportingPage /> },
          { path: 'admin/verifications', element: <VerificationQueuePage /> },
          { path: 'admin/verifications/:verificationId', element: <VerificationDetailsPage /> },
          { path: 'admin/audit-logs', element: <AuditLogsPage /> },
          { path: 'admin/audit-logs/:logId', element: <AuditLogDetailsPage /> },

          // Shared Routes
          { path: 'jobs/:jobId/details', element: <PublicJobDetailsPage /> },
          { path: 'inbox', element: <InboxPage /> }
        ]
      },
    ]
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;