import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/cn";
import { MenuIcon } from "lucide-react";

export const ValuationSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, children, value, min, max, ...props }, ref) => {
  const valuation = value![0] as number;
  const thumbPosition = (valuation - min!) / (max! - min!);
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      value={value}
      min={min}
      max={max}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-7 w-full grow overflow-hidden rounded-full bg-secondary" />
      {children}

      <SliderPrimitive.Thumb
        style={{
          left: `${thumbPosition}%`,
          marginLeft: `${(1 - thumbPosition) * -20}px`,
        }}
        className={cn(
          `absolute  flex items-center justify-center h-7 w-7 mt-4 mx-[-28px] rotate-45 rounded-full  bg-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`,
        )}
      >
        <MenuIcon className="size-4 rotate-45 text-white" />
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});
