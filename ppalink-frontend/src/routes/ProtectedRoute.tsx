import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../context/AuthContext';
import { useDataStore } from '../context/DataStore';
import { useShortlistStore } from '../context/ShortlistStore';
import { SocketProvider } from '../context/SocketContext';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  
  const fetchLookupData = useDataStore((state) => state.fetchLookupData);
  const fetchShortlist = useShortlistStore((state) => state.fetchShortlist);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLookupData();
      if (user?.role === 'AGENCY') {
        fetchShortlist();
      }
    }
  }, [isAuthenticated, user?.role, fetchLookupData, fetchShortlist]);

  if (!isAuthenticated) {
    // Store the original intended location so we can redirect back to it after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, check if a password reset is required.
  if (user?.passwordResetRequired) {
    // If they are not already on the change-password page, force them there.
    if (location.pathname !== '/change-password') {
      return <Navigate to="/change-password" replace />;
    }
  }
  
  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
};

export default ProtectedRoute;