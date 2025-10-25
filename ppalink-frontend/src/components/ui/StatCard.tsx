import { motion } from "framer-motion";
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
  color?: "blue" | "green" | "purple" | "pink";
}

const formatLargeNumber = (num: number | string): string => {
  if (typeof num === "string") return num;
  if (num < 1000) return String(num);
  if (num < 1_000_000) return `${(num / 1000).toFixed(1)}k`;
  if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(1)}m`;
  return `${(num / 1_000_000_000).toFixed(1)}b`;
};

const colorMap = {
  blue: "from-blue-500/10 to-blue-500/5",
  green: "from-green-500/10 to-green-500/5",
  purple: "from-purple-500/10 to-purple-500/5",
  pink: "from-pink-500/10 to-pink-500/5",
};

export const StatCard = ({
  icon: Icon,
  label,
  value,
  isLoading = false,
  linkTo,
  color = "blue",
}: StatCardProps) => {
  const CardWrapper = linkTo ? Link : "div";

  const baseClasses =
    "relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br p-[1px] transition-transform duration-150 transform hover:-translate-y-0.5 hover:shadow-lg";

  const cardClasses =
    "relative flex flex-col justify-between h-full rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 p-3 sm:p-4 md:p-5 shadow-sm dark:shadow-none ring-1 ring-gray-100 dark:ring-white/10 transition-all duration-200";

  return (
    <div className={clsx(baseClasses, colorMap[color])}>
      <CardWrapper
        to={linkTo || ""}
        className={clsx(
          cardClasses,
          linkTo &&
            "cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500/50"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={clsx(
                "flex items-center justify-center rounded-md p-1.5 sm:p-2 transition-colors duration-150",
                {
                  "bg-blue-100/60 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400":
                    color === "blue",
                  "bg-green-100/60 text-green-600 dark:bg-green-500/10 dark:text-green-400":
                    color === "green",
                  "bg-purple-100/60 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400":
                    color === "purple",
                  "bg-pink-100/60 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400":
                    color === "pink",
                }
              )}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            <dt className="text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-300 whitespace-normal leading-tight">
              {label}
            </dt>
          </div>
        </div>

        <div className="mt-2 sm:mt-3">
          {isLoading ? (
            <Skeleton width={70} height={20} />
          ) : (
            <motion.dd
              key={value}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-zinc-50"
            >
              {formatLargeNumber(value)}
            </motion.dd>
          )}
        </div>

        {linkTo && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-2.5 right-3 text-[11px] sm:text-xs text-primary-600 dark:text-primary-400 font-medium"
          >
            View →
          </motion.div>
        )}
      </CardWrapper>
    </div>
  );
};