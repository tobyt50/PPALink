import type { LucideIcon } from 'lucide-react';
import { toast, type Toast } from 'react-hot-toast';

interface InteractiveToastProps {
  t: Toast;
  Icon: LucideIcon;
  iconColorClass: string;
  title: string;
  message: string;
  link: string;
  navigate: (to: string) => void; // navigate is now passed as a prop
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
    <div
      onClick={handleNavigate} // Make the whole toast clickable
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <Icon className={`h-6 w-6 ${iconColorClass}`} aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.dismiss(t.id);
          }}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
