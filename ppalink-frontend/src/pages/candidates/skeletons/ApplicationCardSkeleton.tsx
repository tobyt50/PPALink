import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const ApplicationCardSkeleton = () => {
  return (
    // Replicated the polished card container style
    <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100">
      <div className="flex items-center justify-between">
        <div>
          {/* Mimics candidate name and job title */}
          <Skeleton width={180} height={20} />
          <Skeleton width={150} height={16} className="mt-1.5" />
        </div>
        <div className="flex-shrink-0">
          {/* Mimics the status badge */}
          <Skeleton width={90} height={28} borderRadius="999px" />
        </div>
      </div>
    </div>
  );
};

