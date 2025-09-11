import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../context/AuthContext';
import AdminLayout from './AdminLayout'; // We'll render the AdminLayout here

const AdminProtectedRoute = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // 1. Check if the user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Crucially, check if the authenticated user has the ADMIN role
  if (user?.role !== 'ADMIN') {
    // If not an admin, redirect them to a "Forbidden" page or their own dashboard
    return <Navigate to="/dashboard/candidate" replace />; // Redirect to a safe default
  }

  // 3. If authenticated and an admin, render the AdminLayout
  return <AdminLayout />;
};

export default AdminProtectedRoute;