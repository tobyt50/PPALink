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
    <div
      onClick={handleNavigate}
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } w-full max-w-sm transform-gpu rounded-2xl bg-white dark:bg-zinc-800 shadow-lg dark:shadow-md transition-all hover:bg-gray-50 dark:hover:bg-zinc-800/70 cursor-pointer`}
    >
      <div className="flex items-center p-2.5">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
            <Icon className={`h-5 w-5 ${iconColorClass}`} aria-hidden="true" />
          </div>
        </div>

        {/* Title & Message */}
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-zinc-50">{title}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-zinc-300">{message}</p>
        </div>

        {/* Close Button */}
        <div className="ml-3 flex flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(t.id);
            }}
            className="inline-flex rounded-full p-1.5 text-gray-400 dark:text-zinc-500 transition-colors hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-600 dark:hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
