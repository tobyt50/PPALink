import React, { type ReactNode } from 'react';

interface DropdownTriggerProps {
  children: ReactNode;
  className?: string;
}

export const DropdownTrigger = React.forwardRef<HTMLDivElement, DropdownTriggerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          flex h-10 w-full items-center justify-between rounded-xl border border-gray-300 dark:border-zinc-800
          bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-normal text-gray-700 dark:text-zinc-200 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10
          hover:bg-gray-50 dark:hover:bg-zinc-800 transition
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownTrigger.displayName = 'DropdownTrigger';

