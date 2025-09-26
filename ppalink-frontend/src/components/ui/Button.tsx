import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

// Reduced lift: hover:-translate-y-0.5 (instead of -translate-y-1)
const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-transform transform hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "rounded-xl bg-gradient-to-r from-primary-600 dark:from-primary-500 to-green-500 dark:to-green-500 text-white dark:text-zinc-100 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 hover:opacity-90 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400",
        destructive:
          "rounded-xl bg-red-500 dark:bg-red-500 text-white dark:text-zinc-100 shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 hover:bg-red-600/90 dark:hover:bg-red-500/90 focus-visible:ring-red-400 dark:focus-visible:ring-red-500",
        secondary:
          "rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 hover:bg-gray-200 dark:hover:bg-zinc-700 shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 focus-visible:ring-gray-400 dark:focus-visible:ring-zinc-600",
        outline:
          "rounded-xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 focus-visible:ring-gray-400 dark:focus-visible:ring-zinc-600",
        ghost:
          "rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 focus-visible:ring-gray-300 dark:focus-visible:ring-zinc-700",
        link:
          "text-primary-600 dark:text-primary-400 underline-offset-4 hover:underline focus-visible:ring-primary-400 dark:focus-visible:ring-primary-500",
        outlineTransparent: 
          "rounded-xl border border-white dark:border-black bg-transparent text-white dark:text-zinc-100 hover:bg-white hover:text-primary-600 dark:hover:text-primary-400 focus-visible:ring-white dark:focus-visible:ring-white/20"

      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? (Slot as React.ElementType) : "button";

    return (
      <Comp
        ref={ref}
        disabled={isLoading || props.disabled}
        className={buttonVariants({ variant, size, className })}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

