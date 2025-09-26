import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const JobCardSkeleton = () => {
  return (
    // Replicated the polished card container style
    <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-grow">
          {/* Mimics job title and company name */}
          <Skeleton width="70%" height={24} />
          <Skeleton width="50%" height={16} className="mt-2" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
        {/* Mimics location, type, and skill tags */}
        <Skeleton width={80} height={20} />
        <Skeleton width={100} height={20} />
        <Skeleton width={70} height={24} borderRadius="999px" />
      </div>
    </div>
  );
};

