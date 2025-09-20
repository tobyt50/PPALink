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
  blue: "from-blue-500/90 to-indigo-500/90",
  green: "from-primary-600 to-green-500", // keep green theme
  purple: "from-purple-500/90 to-pink-500/90",
  pink: "from-pink-500/90 to-rose-500/90",
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
            "inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md",
            colorMap[color]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <dt className="text-sm font-medium text-gray-600">{label}</dt>
      </div>

      {/* Value */}
      {isLoading ? (
        <Skeleton width={100} height={26} className="mt-3" />
      ) : (
        <dd className="mt-3 text-3xl font-extrabold text-gray-900">{value}</dd>
      )}
    </div>
  );

  const baseClasses =
    "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-transform transform hover:-translate-y-1 hover:shadow-xl";

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
