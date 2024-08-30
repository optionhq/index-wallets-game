import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { VALUATION_AMPLITUDE } from "@/config";
import { cn } from "@/lib/cn";

export const ValuationSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, children, value, ...props }, ref) => {
  const [min, setMin] = React.useState(value![0] - VALUATION_AMPLITUDE);
  const [max, setMax] = React.useState(value![0] + VALUATION_AMPLITUDE);
  const [isDragging, setIsDragging] = React.useState(false);
  React.useEffect(() => {
    if (isDragging) return;
    setMin(value![0] - VALUATION_AMPLITUDE);
    setMax(value![0] + VALUATION_AMPLITUDE);
  }, [value, isDragging]);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex items-center py-2 w-full touch-none select-none",
        className,
      )}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      value={value}
      min={min}
      max={max}
      {...props}
    >
      <SliderPrimitive.Track className="h-4 w-full grow overflow-hidden rounded-full bg-secondary" />
      {children}
      <SliderPrimitive.Thumb
        className={cn(
          `animated-slider-thumb block  size-8  rounded-full  bg-primary ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`,
        )}
      />
    </SliderPrimitive.Root>
  );
});
