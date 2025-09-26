import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const CandidateCardSkeleton = () => {
  return (
    // Replicated the polished card container style
    <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100">
      <div className="flex items-start">
        {/* Mimics the avatar */}
        <Skeleton circle width={48} height={48} />
        <div className="ml-4 flex-grow">
          {/* Mimics name and location */}
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} className="mt-1.5" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {/* Mimics skill tags */}
        <Skeleton width={70} height={24} borderRadius="999px" />
        <Skeleton width={90} height={24} borderRadius="999px" />
      </div>
    </div>
  );
};

