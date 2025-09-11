import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../context/AuthContext';
import { useDataStore } from '../context/DataStore';
import { useShortlistStore } from '../context/ShortlistStore';

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
    return <Navigate to="/login" replace />;
  }
  
  // ProtectedRoute's only job is to guard. The child routes will define their own layouts.
  return <Outlet />;
};

export default ProtectedRoute;