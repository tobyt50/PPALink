import { CheckCircle, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../context/AuthContext'; // 1. Import the auth store

const DomainVerificationResultPage = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('message');
  
  // 2. Check the user's current authentication state
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const isSuccess = status === 'success';

  // 3. Determine the correct destination URL
  let destinationUrl = '/login'; // Default for logged-out users
  if (isAuthenticated) {
    if (user?.role === 'AGENCY') {
        destinationUrl = '/dashboard/agency/profile';
    } else if (user?.role === 'CANDIDATE') {
        destinationUrl = '/dashboard/candidate';
    }
    // Add other roles if necessary
  }


  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[calc(100vh-200px)]">
      {isSuccess ? (
        <CheckCircle className="h-16 w-16 text-primary-500 dark:text-primary-400" />
      ) : (
        <XCircle className="h-16 w-16 text-red-500" />
      )}
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
        {isSuccess ? 'Domain Verified Successfully!' : 'Verification Failed'}
      </h1>
      <p className="mt-2 text-base text-gray-600 dark:text-zinc-300">
        {isSuccess
          ? "Your agency's domain has been successfully verified. You can now return to your dashboard."
          : message || "The verification link may have expired or is invalid. Please try again."}
      </p>
      <div className="mt-6">
        {/* 4. Use the dynamic destination URL for the button's link */}
        <Link to={destinationUrl}>
          <Button>
            {isAuthenticated ? 'Return to Dashboard' : 'Return to Login'}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DomainVerificationResultPage;
