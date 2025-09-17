import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

// Layouts & Guards
import Navbar from '../components/layout/Navbar';
import ProtectedRoute from './ProtectedRoute';
import PublicLayout from './PublicLayout';
import RoleBasedLayout from './RoleBasedLayout';

// Page Imports (assuming these paths are correct)
import AdminDashboard from '../pages/admin/Dashboard';
import ManageUsersPage from '../pages/admin/ManageUsers';
import VerificationDetailsPage from '../pages/admin/VerificationDetails';
import VerificationQueuePage from '../pages/admin/VerificationQueue';
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
import ApplicationDetailsPage from '../pages/applications/ApplicationDetails';
import AcceptInvitePage from '../pages/auth/AcceptInvite';
import AcceptInviteLoggedInPage from '../pages/auth/AcceptInviteLoggedIn';
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

const router = createBrowserRouter([
  // --- Group 1: Public Routes ---
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: '/login', element: <Login /> },
      { path: '/register/candidate', element: <RegisterCandidate /> },
      { path: '/register/agency', element: <RegisterAgency /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/handle-invite', element: <HandleInvitePage /> },
      { path: '/accept-invite', element: <AcceptInvitePage /> },
      { path: '/accept-invite-authenticated', element: <AcceptInviteLoggedInPage /> },
    ],
  },
  
  // --- Group 2: All Authenticated Routes ---
  {
    path: '/',
    element: <ProtectedRoute />, // The master guard for all children
    children: [
      // Sub-Group for pages using the standard DashboardLayout
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
          { path: 'dashboard/agency/jobs', element: <JobPostsPage /> },
          { path: 'dashboard/agency/jobs/create', element: <CreateJobPage /> },
          { path: 'dashboard/agency/:agencyId/jobs/:jobId/edit', element: <EditJobPage /> },
          { path: 'dashboard/agency/:agencyId/jobs/:jobId', element: <JobDetailsPage /> },
          { path: 'dashboard/agency/:agencyId/jobs/:jobId/pipeline', element: <JobPipelinePage /> },
          { path: 'dashboard/agency/candidates/browse', element: <BrowseCandidatesPage /> },
          { path: 'dashboard/agency/candidates/shortlisted', element: <ShortlistedCandidatesPage /> },
          { path: 'dashboard/agency/candidates/:candidateId/profile', element: <PublicProfilePage /> }, // This was the agency-facing public profile
          { path: 'dashboard/agency/applications/:applicationId', element: <ApplicationDetailsPage /> },
          
          //Admin Dashboard Routes
          { path: 'admin/dashboard', element: <AdminDashboard /> },
          { path: 'admin/users', element: <ManageUsersPage /> },
          { path: 'admin/verifications', element: <VerificationQueuePage /> },
          { path: 'admin/verifications/:verificationId', element: <VerificationDetailsPage /> },
        ]
      },
      // Sub-Group for the full-page Inbox Layout
      {
        path: 'inbox',
        element: (
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow"><Outlet /></main>
          </div>
        ),
        children: [
          { index: true, element: <InboxPage /> },
        ]
      },
      // Sub-Group for candidate-facing public job details (uses a simpler layout)
      {
        path: 'jobs/:jobId/details',
        element: (
          <div className="min-h-screen flex flex-col main-background">
            <Navbar />
            <main className="flex-grow p-4 sm:p-6 lg:p-8"><Outlet /></main>
          </div>
        ),
        children: [
          { index: true, element: <PublicJobDetailsPage /> }
        ]
      }
    ]
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;