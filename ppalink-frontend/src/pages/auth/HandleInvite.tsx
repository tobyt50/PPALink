import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../context/AuthContext';
import invitationService from '../../services/invitation.service';

const HandleInvitePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  // Get the logout action to ensure a clean slate
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const handleToken = async () => {
      if (!token) {
        navigate('/'); // No token, go home
        return;
      }

      try {
        // 1. Verify the token and check if the user exists on the backend
        const { email: targetEmail, userExists } = await invitationService.verifyToken(token);

        // 2. Log out any currently logged-in user to prevent session conflicts
        logout();

        if (userExists) {
          // 3. If the user exists, redirect to the login page with a special message
          //    and pass the original location so we can complete the action after login.
          navigate('/login', {
            replace: true,
            state: {
              message: `This invitation is for ${targetEmail}. Please log in to accept.`,
              from: location, 
            },
          });
        } else {
          // 4. If the user does not exist, redirect to the sign-up acceptance page
          navigate(`/accept-invite?token=${token}`, { replace: true });
        }
      } catch (err: any) {
        // If the token itself is invalid, log the user out and show an error on the login page
        logout();
        navigate('/login', {
          replace: true,
          state: {
            error: err.response?.data?.message || "This invitation is invalid or has expired.",
          },
        });
      }
    };

    handleToken();
  }, [token, navigate, logout, location]);

  // This component shows a loading state while it performs the async check and redirect.
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      <p className="text-gray-500">Processing your invitation...</p>
    </div>
  );
};

export default HandleInvitePage;