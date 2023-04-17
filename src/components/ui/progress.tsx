import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "~/utils/ui/cn";

// Added isDone
const ProgressBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { isDone?: boolean }
>(({ className, value, isDone, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        // Changed bg-slate-400 to bg-slate-200
        "h-full w-full flex-1 bg-slate-900 transition-all dark:bg-slate-200",
        isDone ? "bg-slate-400 dark:bg-blue-500" : ""
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
ProgressBar.displayName = ProgressPrimitive.Root.displayName;

export { ProgressBar };
