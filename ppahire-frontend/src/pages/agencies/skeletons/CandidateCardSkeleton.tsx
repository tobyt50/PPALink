import Skeleton from 'react-loading-skeleton';

export const CandidateCardSkeleton = () => {
  return (
    <div className="border border-gray-200 bg-white rounded-lg p-4">
      <div className="flex items-start">
        <Skeleton circle width={48} height={48} />
        <div className="ml-4 flex-grow">
          <Skeleton width="60%" />
          <Skeleton count={2} className="mt-1" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Skeleton width={70} height={20} borderRadius="999px" />
        <Skeleton width={90} height={20} borderRadius="999px" />
      </div>
      <div className="mt-4 border-t pt-3 flex items-center justify-between">
        <Skeleton width="50%" />
        <Skeleton width="30%" />
      </div>
    </div>
  );
};