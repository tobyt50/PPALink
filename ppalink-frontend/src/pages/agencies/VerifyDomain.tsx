import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import agencyService from '../../services/agency.service'; // We will add the new function here

const VerifyDomainPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [message] = useState('Verifying your domain...');

  useEffect(() => {
    const finalize = async () => {
      if (!token) {
        navigate('/login', { state: { error: 'No verification token found.' } });
        return;
      }

      try {
        await agencyService.finalizeDomainVerification(token);
        // On success, redirect to the RESULT page
        navigate('/verify-domain-result?status=success');
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Verification failed.';
        // On failure, redirect to the RESULT page with an error
        navigate(`/verify-domain-result?status=error&message=${encodeURIComponent(errorMessage)}`);
      }
    };

    finalize();
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400" />
      <p className="text-gray-500 dark:text-zinc-400">{message}</p>
    </div>
  );
};

export default VerifyDomainPage;
