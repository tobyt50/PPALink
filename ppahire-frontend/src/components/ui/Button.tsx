import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

// 1. Define the styling variants for the button using CVA
const buttonVariants = cva(
  // Base classes applied to all buttons
  'inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700/90 shadow-sm',
        destructive: 'bg-red-500 text-white hover:bg-red-600/90 shadow-sm',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300/80 shadow-sm',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

// 2. Define the props interface for type safety
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

// 3. Create the component with forwardRef for accessibility and composition
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
    
    // Use Slot if asChild is true, allowing us to wrap other components
    const Comp = asChild ? (Slot as React.ElementType) : 'button';
    
    // Wrap with framer-motion for animations
    const MotionComp = motion(Comp);

    return (
      <MotionComp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={isLoading || props.disabled}
        // Framer Motion animation for a satisfying click effect
        whileTap={{ scale: 0.97 }}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </>
        ) : (
          children
        )}
      </MotionComp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

