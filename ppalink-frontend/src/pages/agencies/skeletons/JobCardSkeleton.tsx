import Skeleton from 'react-loading-skeleton';

export const JobCardSkeleton = () => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex-grow">
          <Skeleton width="50%" />
          <Skeleton width="30%" className="mt-2" />
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
            <Skeleton width={60} height={20} borderRadius="999px" />
            <Skeleton width={120} height={32} borderRadius="6px" />
        </div>
      </div>
    </div>
  );
};