import type { LucideIcon } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";
import clsx from "clsx";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  isLoading?: boolean;
  linkTo?: string;
  color?: "blue" | "green" | "purple" | "pink"; // kept for future theming if needed
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  isLoading = false,
  linkTo,
}: StatCardProps) => {
  const cardInner = (
    <div className="flex flex-col">
      {/* Icon + Label Row */}
      <div className="flex items-start gap-3">
        {/* Icon with light/dark primary coloring */}
        <Icon className="h-6 w-6 flex-shrink-0 text-primary-600 dark:text-primary-500" />

        {/* Label with wrapping */}
        <dt className="text-sm font-medium text-gray-600 dark:text-zinc-300 whitespace-normal break-words">
          {label}
        </dt>
      </div>

      {/* Value with wrapping */}
      {isLoading ? (
        <Skeleton width={100} height={26} className="mt-3" />
      ) : (
        <dd className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-zinc-50 whitespace-normal break-words">
          {value}
        </dd>
      )}
    </div>
  );

  const baseClasses =
    "rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm dark:shadow-none ring-1 ring-gray-100 dark:ring-white/10 transition-transform transform hover:-translate-y-1 hover:shadow-xl";

  return linkTo ? (
    <Link
      to={linkTo}
      className={clsx(
        baseClasses,
        "focus:outline-none focus:ring-0.5 focus:ring-offset-0.5 focus:ring-primary-500"
      )}
    >
      {cardInner}
    </Link>
  ) : (
    <div className={baseClasses}>{cardInner}</div>
  );
};
