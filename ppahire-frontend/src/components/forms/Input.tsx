import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

// 1. Define the props interface for type safety.
// It accepts all standard HTML input attributes plus our custom ones.
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: boolean;
}

// 2. Create the component with forwardRef for form library integration.
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, error = false, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {/* If an icon is provided, render it inside the container */}
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}

        <input
          type={type}
          className={`
            flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-colors
            file:border-0 file:bg-transparent file:text-sm file:font-medium
            placeholder:text-gray-400
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${Icon ? 'pl-10' : 'pl-3'}
            ${error
              ? 'border-red-500 text-red-600 focus-visible:ring-red-500'
              : 'border-gray-300 focus-visible:ring-primary-500'
            }
            ${className}
          `}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
