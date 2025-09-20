import { X } from 'lucide-react';
import { toast, type Toast } from 'react-hot-toast';
import type { LucideIcon } from 'lucide-react';

interface InteractiveToastProps {
  t: Toast;
  Icon: LucideIcon;
  iconColorClass: string;
  title: string;
  message: string;
  link: string;
  navigate: (to: string) => void;
}

export const InteractiveToast = ({
  t,
  Icon,
  iconColorClass,
  title,
  message,
  link,
  navigate,
}: InteractiveToastProps) => {
  const handleNavigate = () => {
    navigate(link);
    toast.dismiss(t.id);
  };

  return (
    // Polished Container: Rounded, Shadow, Ring, and Hover Effect
    <div
      onClick={handleNavigate}
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } w-full max-w-sm transform-gpu rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all hover:bg-gray-50/70 cursor-pointer`}
    >
      <div className="flex items-start p-4">
        {/* Polished Icon Container */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Icon className={`h-6 w-6 ${iconColorClass}`} aria-hidden="true" />
          </div>
        </div>
        
        {/* Polished Typography and Layout */}
        <div className="ml-4 flex-1">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-600">{message}</p>
        </div>

        {/* Polished Dismiss Button */}
        <div className="ml-4 flex flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
            className="inline-flex rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};