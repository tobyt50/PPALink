import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import Login from '../pages/auth/Login';
import RegisterAgency from '../pages/auth/RegisterAgency';
import RegisterCandidate from '../pages/auth/RegisterCandidate';

// --- Import Layouts and Dashboard Pages ---
import BrowseCandidatesPage from '../pages/agencies/BrowseCandidates';
import CompanyProfilePage from '../pages/agencies/CompanyProfile';
import CreateJobPage from '../pages/agencies/CreateJob';
import AgencyDashboard from '../pages/agencies/Dashboard';
import EditCompanyProfilePage from '../pages/agencies/EditCompanyProfile';
import EditJobPage from '../pages/agencies/EditJob';
import JobPostsPage from '../pages/agencies/JobPosts';
import ShortlistedCandidatesPage from '../pages/agencies/ShortlistedCandidates';
import CandidateDashboard from '../pages/candidates/Dashboard';
import EditProfilePage from '../pages/candidates/EditProfile';
import CandidateProfilePage from '../pages/candidates/Profile';
import PublicProfilePage from '../pages/candidates/PublicProfile';
import JobDetailsPage from '../pages/jobs/JobDetails';
import ProtectedRoute from './ProtectedRoute';

const router = createBrowserRouter([
  // --- Public routes ---
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register/candidate', element: <RegisterCandidate /> },
      { path: '/register/agency', element: <RegisterAgency /> },
      {
        index: true,
        element: (
          <div className="text-center p-10">
            <h1 className="text-2xl font-bold">Home Page</h1>
            <a href="/login" className="text-primary-600 hover:underline">Go to Login Page</a>
          </div>
        ),
      },
    ],
  },
  // --- Protected dashboard routes ---
  {
    path: '/dashboard',
    // 2. Use ProtectedRoute as the main element.
    // It will handle both auth checking and rendering the DashboardLayout.
    element: <ProtectedRoute />, 
    children: [
      {
        path: 'candidate',
        element: <CandidateDashboard />,
      },
      {
        path: 'candidate/profile',
        element: <CandidateProfilePage />,
      },
      {
        path: 'candidate/profile/edit',
        element: <EditProfilePage />,
      },
      {
        path: 'agency', // Accessible at /dashboard/agency
        element: <AgencyDashboard />,
      },
      {
        path: 'agency/profile', // Accessible at /dashboard/agency/profile
        element: <CompanyProfilePage />,
      },
      {
        path: 'agency/profile/edit',
        element: <EditCompanyProfilePage />,
      },
      {
        path: 'agency/jobs',
        element: <JobPostsPage />,
      },
      {
        path: 'agency/jobs/create',
        element: <CreateJobPage />,
      },
      {
        path: 'agency/:agencyId/jobs/:jobId',
        element: <JobDetailsPage />,
      },
      {
        path: 'agency/:agencyId/jobs/:jobId/edit',
        element: <EditJobPage />,
      },
      {
        path: 'agency/candidates/browse',
        element: <BrowseCandidatesPage />,
      },
      {
        path: 'agency/candidates/shortlisted',
        element: <ShortlistedCandidatesPage />,
      },
      {
        path: 'agency/candidates/:candidateId/profile',
        element: <PublicProfilePage />,
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;