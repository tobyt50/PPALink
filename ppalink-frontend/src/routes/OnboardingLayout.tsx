import { Link, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import candidateService from '../services/candidate.service';
import agencyService from '../services/agency.service';
import { useAuthStore } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import type { User } from '../types/user';

const OnboardingLayout = () => {
  const navigate = useNavigate();
  const { login, user } = useAuthStore();

  const handleSkip = async () => {
    if (!user) return;

    try {
      let updatedUser: typeof user;

      if (user.role === 'CANDIDATE') {
        await candidateService.markOnboardingComplete();
        updatedUser = { ...user, candidateProfile: { ...user.candidateProfile!, hasCompletedOnboarding: true } };
      } else if (user.role === 'AGENCY') {
        await agencyService.markOnboardingComplete();
        const agencyProfile = user.ownedAgencies ? { ...user.ownedAgencies[0], hasCompletedOnboarding: true } : undefined;
        updatedUser = { ...user, ownedAgencies: agencyProfile ? [agencyProfile] : [] };
      } else {
        navigate('/');
        return;
      }

      login(updatedUser, useAuthStore.getState().token!);
      toast.success("You can complete your profile later from your dashboard.");
      
      const dashboardPath = user.role === 'AGENCY' ? '/dashboard/agency' : '/dashboard/candidate';
      navigate(dashboardPath);

    } catch {
      toast.error("An error occurred. Please try again.");
    }
  };

  const { data: currentUser } = useFetch<User>('/auth/me/profile');
  const profileType = currentUser?.candidateProfile?.profileType;

  return (
    <div className="min-h-screen relative flex flex-col transition-colors">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.JPG')" }}
      />
      <div className="absolute inset-0 bg-black/50" />

      <header className="flex-shrink-0 bg-white/95 dark:bg-zinc-900/95 border-b border-gray-100 dark:border-zinc-800 backdrop-blur-sm z-10">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center">
            <img src="/header.png" alt="PPALink Logo" className="h-9 w-28" />
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip for now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Outlet context={{ profileType }} />
        </div>
      </main>
    </div>
  );
};

export default OnboardingLayout;
