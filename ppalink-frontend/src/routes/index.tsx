import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts & Guards
import ProtectedRoute from './ProtectedRoute';
import PublicLayout from './PublicLayout';
import RoleBasedLayout from './RoleBasedLayout';

// Page Imports
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
import ManageAdminsPage from '../pages/admin/ManageAdmins';
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
import ChangePasswordPage from '../pages/auth/ChangePassword';
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
import OnboardingGuard from './OnboardingGuard';
import OnboardingLayout from './OnboardingLayout';
import SummaryStep from '../pages/onboarding/candidate/SummaryStep';
import WorkExperienceStep from '../pages/onboarding/candidate/WorkExperienceStep';
import EducationStep from '../pages/onboarding/candidate/EducationStep';
import SkillsStep from '../pages/onboarding/candidate/SkillsStep';
import CvUploadStep from '../pages/onboarding/candidate/CvUploadStep';
import AgencyProfileStep from '../pages/onboarding/agency/ProfileStep';
import PostJobStep from '../pages/onboarding/agency/PostJobStep';
import DiscoverStep from '../pages/onboarding/agency/DiscoverStep';
import PipelineStep from '../pages/onboarding/agency/PipelineStep';
import TeamStep from '../pages/onboarding/agency/TeamStep';
import AdminWelcomePage from '../pages/onboarding/admin/AdminWelcome';

const router = createBrowserRouter([
  // Group 1: Public Routes
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
      { path: 'domain-verified', element: <DomainVerificationResultPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPolicyPage /> },
    ],
  },

  // Group 2: Special Authenticated Route (for password change)
  // This route is protected but uses a minimal layout (no sidebar/navbar)
  {
      path: '/change-password',
      element: <ProtectedRoute />,
      children: [
          { index: true, element: <ChangePasswordPage /> }
      ]
  },

  // Group 3: Candidate Onboarding Route
  {
    path: '/onboarding/candidate',
    element: <ProtectedRoute />,
    children: [
      {
        element: <OnboardingLayout />,
        children: [
          { path: 'summary', element: <SummaryStep /> },
          { path: 'work-experience', element: <WorkExperienceStep /> },
          { path: 'education', element: <EducationStep /> },
          { path: 'skills', element: <SkillsStep /> },
          { path: 'cv-upload', element: <CvUploadStep /> },
        ]
      }
    ]
  },

  // Group 4: Agency Onboarding Route
  {
    path: '/onboarding/agency',
    element: <ProtectedRoute />,
    children: [
      {
        element: <OnboardingLayout />,
        children: [
          { path: 'profile', element: <AgencyProfileStep /> },
          { path: 'post-job', element: <PostJobStep /> },
          { path: 'discover', element: <DiscoverStep /> },
          { path: 'pipeline', element: <PipelineStep /> },
          { path: 'team', element: <TeamStep /> },
        ]
      }
    ]
  },
  // Group 5: Admin Onboarding Route
  {
    path: '/onboarding/admin',
    element: <ProtectedRoute />, // It is a protected route
    children: [
      {
        // We can reuse the same minimal layout
        element: <OnboardingLayout />,
        children: [
          { path: 'welcome', element: <AdminWelcomePage /> },
        ]
      }
    ]
  },
  
  // Group 6: Other Authenticated Routes
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <OnboardingGuard>
            <RoleBasedLayout />
          </OnboardingGuard>
        ),
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
          { path: 'admin/admins', element: <ManageAdminsPage /> },

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