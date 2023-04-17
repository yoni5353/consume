import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "~/utils/ui/cn";

const ConSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    circularThumb?: boolean;
    isDone?: boolean;
  }
>(({ className, circularThumb, isDone, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <SliderPrimitive.Range
        className={cn("absolute h-full bg-slate-900  dark:bg-slate-200", {
          "dark:bg-blue-600": isDone,
        })}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block border-2 border-slate-900 bg-white ring-2 ring-offset-2 transition-colors focus:outline-none focus:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-100 dark:bg-slate-200 dark:ring-slate-400 dark:ring-offset-slate-900",
        circularThumb ? "h-3 w-2 rounded-full" : "mt-4 h-3 w-2 rounded-t-full"
      )}
    />
  </SliderPrimitive.Root>
));
ConSlider.displayName = SliderPrimitive.Root.displayName;

export { ConSlider };
