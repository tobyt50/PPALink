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
  color?: "blue" | "green" | "purple" | "pink"; // gradient themes
}

const colorMap = {
  blue: "from-blue-500/90 dark:from-blue-400/90 to-indigo-500/90 dark:to-indigo-400/90",
  green: "from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-500", // keep green theme
  purple: "from-purple-500/90 dark:from-purple-400/90 to-pink-500/90 dark:to-pink-400/90",
  pink: "from-pink-500/90 dark:from-pink-400/90 to-rose-500/90 dark:to-rose-400/90",
};

export const StatCard = ({
  icon: Icon,
  label,
  value,
  isLoading = false,
  linkTo,
  color = "blue",
}: StatCardProps) => {
  const cardInner = (
    <div className="flex flex-col">
      {/* Icon + Label Row */}
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            "inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white dark:text-zinc-100 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10",
            colorMap[color]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <dt className="text-sm font-medium text-gray-600 dark:text-zinc-300">{label}</dt>
      </div>

      {/* Value */}
      {isLoading ? (
        <Skeleton width={100} height={26} className="mt-3" />
      ) : (
        <dd className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-zinc-50">{value}</dd>
      )}
    </div>
  );

  const baseClasses =
    "rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 ring-1 ring-gray-100 dark:ring-white/10 transition-transform transform hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-none dark:ring-1 dark:ring-white/10";

  return linkTo ? (
    <Link
      to={linkTo}
      className={clsx(
        baseClasses,
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      )}
    >
      {cardInner}
    </Link>
  ) : (
    <div className={baseClasses}>{cardInner}</div>
  );
};
