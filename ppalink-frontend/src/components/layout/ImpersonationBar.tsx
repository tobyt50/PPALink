import { User, X } from 'lucide-react';
import { useAuthStore } from '../../context/AuthContext';

export const ImpersonationBar = () => {
  const { isImpersonating, user, stopImpersonation } = useAuthStore();

  const handleStopImpersonating = () => {
    stopImpersonation();
    window.location.href = '/admin/dashboard';
  };

  if (!isImpersonating) {
    return null;
  }

  return (
    <div 
      data-impersonating="true"
      className="fixed top-0 left-0 right-0 z-[50] h-10 bg-yellow-400 text-yellow-900 px-4 flex items-center justify-center text-sm font-semibold"
    >
      <User className="h-4 w-4 mr-2" />
      <span>
        You are currently viewing as <span className="font-bold">{user?.email}</span>.
      </span>
      <button onClick={handleStopImpersonating} className="ml-4 flex items-center font-bold underline hover:text-yellow-800">
        <X className="h-4 w-4 mr-1" />
        Stop Impersonating
      </button>
    </div>
  );
};