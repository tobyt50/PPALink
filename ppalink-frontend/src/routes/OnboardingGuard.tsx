import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import type { User } from '../types/user';

const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { user: isAuthenticated } = useAuthStore();
  const location = useLocation();

  const { data: currentUser, isLoading } = useFetch<User>(
    isAuthenticated ? '/auth/me/profile' : null
  );

  if (isLoading || (isAuthenticated && !currentUser)) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600"/></div>;
  }
  
  if (!isAuthenticated || !currentUser) {
      return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Handle Candidate Onboarding
  const candidateProfile = currentUser.candidateProfile;
  if (currentUser.role === 'CANDIDATE' && candidateProfile && !candidateProfile.hasCompletedOnboarding) {
    if (!location.pathname.startsWith('/onboarding/candidate')) {
      return <Navigate to="/onboarding/candidate/summary" replace />;
    }
  }

  // 2. Handle Agency Onboarding
  const agencyProfile = currentUser.ownedAgencies?.[0];
  if (currentUser.role === 'AGENCY' && agencyProfile && !agencyProfile.hasCompletedOnboarding) {
    if (!location.pathname.startsWith('/onboarding/agency')) {
      return <Navigate to="/onboarding/agency/profile" replace />;
    }
  }

  // Handle Admin Onboarding
  if ((currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && !currentUser.hasCompletedAdminOnboarding) {
    if (!location.pathname.startsWith('/onboarding/admin')) {
      return <Navigate to="/onboarding/admin/welcome" replace />;
    }
  }
  return <>{children}</>;
};

export default OnboardingGuard;