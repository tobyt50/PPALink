import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import Login from '../pages/auth/Login';
import RegisterAgency from '../pages/auth/RegisterAgency';
import RegisterCandidate from '../pages/auth/RegisterCandidate';

// --- 1. Import the new components ---
import CandidateDashboard from '../pages/candidates/Dashboard';
import DashboardLayout from './Layouts';

const router = createBrowserRouter([
  // --- Public routes (auth, landing page, etc.) ---
  {
    path: '/',
    element: <App />, // The basic layout with just the background
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
  // --- 2. Add new protected dashboard routes ---
  {
    path: '/dashboard',
    element: <DashboardLayout />, // All routes inside use the DashboardLayout
    children: [
      {
        path: 'candidate', // Accessible at /dashboard/candidate
        element: <CandidateDashboard />,
      },
      // We will add /dashboard/agency here later
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;