import { motion } from 'framer-motion';
import { AlertTriangle, Building, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../context/AuthContext';
import invitationService from '../../services/invitation.service';

const AcceptInviteLoggedInPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!token) {
      setError("Invitation token is missing or invalid.");
    }
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      await invitationService.acceptInviteAsLoggedInUser(token);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to accept the invitation. It may be invalid or expired.");
    } finally {
      setIsLoading(false);
    }
  };

  // Polished Page Wrapper
  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/5">{children}</div>
      </motion.div>
    </div>
  );

  if (error) {
    return (
      <PageWrapper>
        <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-gray-900">Invitation Error</h1>
            <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </PageWrapper>
    );
  }
  
  if (isSuccess) {
    return (
      <PageWrapper>
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
            Invitation Accepted!
          </h1>
          <p className="mt-2 text-sm text-gray-600">You have successfully joined the agency. You will now be redirected.</p>
          <div className="mt-8">
            <Link to="/dashboard/agency">
              <Button size="lg" className="w-full rounded-xl shadow-md bg-gradient-to-r from-primary-600 to-green-500 text-white hover:opacity-90 transition">
                Go to Agency Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <Building className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="mt-6 text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
          Accept Invitation
        </h1>
        <p className="mt-4 text-sm text-gray-600">
          You are currently logged in as <strong className="text-primary-700">{user?.email}</strong>.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Click the button below to join the new agency. Your account will be upgraded to an agency role.
        </p>
      </div>
      <div className="mt-8">
        <Button 
          onClick={handleAccept} 
          className="w-full rounded-xl shadow-md bg-gradient-to-r from-primary-600 to-green-500 text-white hover:opacity-90 transition" 
          isLoading={isLoading} 
          size="lg"
        >
          Accept & Join Team
        </Button>
      </div>
    </PageWrapper>
  );
};

export default AcceptInviteLoggedInPage;