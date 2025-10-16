import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../context/AuthContext';
import DashboardLayout from './Layouts';
import PublicLayout from './PublicLayout';

const HybridLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If the user is authenticated, wrap the content in the main DashboardLayout.
  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    );
  }

  // Otherwise, wrap the content in the PublicLayout.
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
};

export default HybridLayout;