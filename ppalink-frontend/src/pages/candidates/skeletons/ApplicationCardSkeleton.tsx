import Skeleton from 'react-loading-skeleton';

export const ApplicationCardSkeleton = () => {
  return (
    <div className="p-4 border-b">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-grow">
          <Skeleton width="40%" />
          <Skeleton width="60%" className="mt-2" />
        </div>
        <div className="flex flex-col sm:items-end flex-shrink-0 w-full sm:w-auto">
          <Skeleton width={80} height={24} borderRadius="999px" />
          <Skeleton width={120} height={16} className="mt-2" />
        </div>
      </div>
    </div>
  );
};