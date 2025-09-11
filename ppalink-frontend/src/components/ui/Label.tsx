import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

// We use cva here for consistency, even though it has only one variant for now.
// This establishes a pattern for future extensions if needed.
const labelVariants = cva(
  'text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

// We use React.forwardRef to allow parent components to pass a ref to the underlying Radix component.
const Label = React.forwardRef<
  // This gets the type of the Radix Label's DOM element
  React.ElementRef<typeof LabelPrimitive.Root>,
  // This gets the type of the Radix Label's props and adds our custom variants
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  // The actual component from Radix UI
  <LabelPrimitive.Root
    ref={ref}
    className={labelVariants({ className })}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
