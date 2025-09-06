import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../context/AuthContext';
import DashboardLayout from './Layouts';

const ProtectedRoute = () => {
  // 1. Get the authentication status from our global store.
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // 2. Check the status.
  if (!isAuthenticated) {
    // 3. If the user is not authenticated, redirect them to the login page.
    // The `replace` prop is used to prevent the user from going "back" to the protected route.
    return <Navigate to="/login" replace />;
  }

  // 4. If the user is authenticated, render the DashboardLayout which in turn renders the requested page via <Outlet />.
  return <DashboardLayout />;
};

export default ProtectedRoute;