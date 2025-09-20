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
          flex h-10 w-full items-center justify-between rounded-xl border border-gray-300
          bg-white px-3 py-2 text-sm font-normal text-gray-700 shadow-sm
          hover:bg-gray-50 transition
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
