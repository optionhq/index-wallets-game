import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/cn";
import { GripVerticalIcon } from "lucide-react";

export const ValuationSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, children, value, min, max, ...props }, ref) => {
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
      <SliderPrimitive.Track className="h-[28px] w-full grow overflow-hidden rounded-full bg-secondary" />
      {children}

      <SliderPrimitive.Thumb
        className={cn(
          ` flex items-center justify-center h-[31px] w-[31px] mt-[64px]  rounded-sm  bg-primary ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`,
        )}
      >
        <GripVerticalIcon className="size-4  text-white" />
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});
