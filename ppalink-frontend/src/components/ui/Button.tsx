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
          "rounded-xl bg-gradient-to-r from-primary-600 to-green-500 text-white shadow-md hover:opacity-90 focus-visible:ring-primary-500",
        destructive:
          "rounded-xl bg-red-500 text-white shadow-md hover:bg-red-600/90 focus-visible:ring-red-400",
        secondary:
          "rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-sm focus-visible:ring-gray-400",
        outline:
          "rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus-visible:ring-gray-400",
        ghost:
          "rounded-xl hover:bg-gray-100 text-gray-700 focus-visible:ring-gray-300",
        link:
          "text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-400",
        outlineTransparent: 
          "rounded-xl border border-white bg-transparent text-white hover:bg-white hover:text-primary-600 focus-visible:ring-white"

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
