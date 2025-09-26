import type { LucideIcon } from "lucide-react";
import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, icon: Icon, error = false, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {/* Icon (if provided) */}
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon
              className={`h-5 w-5 ${
                error ? "text-red-400 dark:text-red-500" : "text-gray-400 dark:text-zinc-500"
              }`}
              aria-hidden="true"
            />
          </div>
        )}

        <input
          type={type}
          ref={ref}
          className={`
            flex h-10 w-full rounded-xl border bg-white dark:bg-zinc-900 px-3 py-2 text-sm
            transition-colors duration-150
            file:border-0 file:bg-transparent file:text-sm file:font-medium
            placeholder:text-gray-400 dark:placeholder:text-zinc-600
            focus-visible:outline-none focus-visible:ring-1
            disabled:cursor-not-allowed disabled:opacity-50
            ${Icon ? "pl-10" : "pl-3"}
            ${
              error
                ? "border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 placeholder:text-red-400 dark:placeholder:text-red-500/80 focus-visible:ring-red-400 dark:focus-visible:ring-red-500"
                : "border-gray-200 dark:border-zinc-800 focus-visible:ring-primary-600"
            }
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

