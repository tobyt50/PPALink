import type { LucideIcon } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  isLoading?: boolean;
}

export const StatCard = ({ icon: Icon, label, value, isLoading = false }: StatCardProps) => {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dt className="truncate text-sm font-medium text-gray-500">{label}</dt>
          {isLoading ? (
            <Skeleton width={80} className="mt-1" />
          ) : (
            <dd className="text-2xl font-semibold tracking-tight text-gray-900">{value}</dd>
          )}
        </div>
      </div>
    </div>
  );
};