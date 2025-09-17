import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../context/AuthContext';
import AdminLayout from './AdminLayout';
import DashboardLayout from './Layouts';

const RoleBasedLayout = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    // This case should theoretically not be hit if used within ProtectedRoute, but it's a safe fallback.
    return <Navigate to="/login" replace />;
  }

  // Render the correct layout based on the user's role
  if (user.role === 'ADMIN') {
    return <AdminLayout />;
  }

  // Default to the standard dashboard layout for CANDIDATE and AGENCY roles
  return <DashboardLayout />;
};

export default RoleBasedLayout;