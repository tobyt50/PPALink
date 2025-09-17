import { Building, CheckCircle } from 'lucide-react';
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

  // This is a simple check; the real validation happens on the backend
  useEffect(() => {
    if (!token) {
      setError("Invitation token is missing.");
    }
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      await invitationService.acceptInviteAsLoggedInUser(token);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to accept invitation.");
    } finally {
      setIsLoading(false);
    }
  };

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-lg md:p-10">{children}</div>
    </div>
  );

  if (error) {
    return <PageWrapper><div className="text-center text-red-500">{error}</div></PageWrapper>;
  }
  if (isSuccess) {
    return <PageWrapper>
      <div className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-primary-600" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">Invitation Accepted!</h1>
        <p className="mt-2 text-sm text-gray-600">You have successfully joined the agency. You will now be redirected.</p>
        <div className="mt-6"><Link to="/dashboard/agency"><Button className="w-full">Go to Agency Dashboard</Button></Link></div>
      </div>
    </PageWrapper>;
  }

  return (
    <PageWrapper>
      <div className="text-center">
        <Building className="mx-auto h-12 w-12 text-primary-600" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">Accept Invitation</h1>
        <p className="mt-4 text-sm text-gray-600">
          You are currently logged in as <strong className="text-primary-700">{user?.email}</strong>.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Click the button below to join the new agency. Your account role will be updated.
        </p>
      </div>
      <div className="mt-8">
        <Button onClick={handleAccept} className="w-full" isLoading={isLoading} size="lg">
          Accept & Join Team
        </Button>
      </div>
    </PageWrapper>
  );
};

export default AcceptInviteLoggedInPage;