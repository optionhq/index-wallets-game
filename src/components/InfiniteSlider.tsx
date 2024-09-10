import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { VALUATION_AMPLITUDE } from "@/config";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

export interface InfiniteSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  symbol?: string;
  referenceValue?: number;
}

const REFERENCE_POINT_SIZE = "0.6rem";

const MotionThumb = motion(SliderPrimitive.Thumb);

export const InfiniteSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  InfiniteSliderProps
>(
  (
    {
      className,
      children,
      value,
      min,
      max: _max,
      symbol,
      referenceValue,
      ...props
    },
    ref,
  ) => {
    const [localMin, setLocalMin] = React.useState(
      value![0] - VALUATION_AMPLITUDE,
    );
    const [localMax, setLocalMax] = React.useState(
      value![0] + VALUATION_AMPLITUDE,
    );

    const [valueAfterDrag, setValueAfterDrag] = React.useState(value![0]);

    const referenceValuePositionPercent =
      referenceValue !== undefined
        ? referenceValue < localMin
          ? -5
          : referenceValue > localMax
            ? 105
            : ((referenceValue - localMin) / (localMax - localMin)) * 100
        : undefined;

    const referenceDistance = (referenceValue ?? 0) - valueAfterDrag;

    const [isDragging, setIsDragging] = React.useState(false);
    React.useEffect(() => {
      if (isDragging) return;
      const newLocalMin =
        min !== undefined
          ? Math.max(value![0] - VALUATION_AMPLITUDE, min)
          : value![0] - VALUATION_AMPLITUDE;
      setLocalMin(newLocalMin);
      setLocalMax(newLocalMin + 2 * VALUATION_AMPLITUDE);
      setValueAfterDrag(value![0]);
    }, [value, isDragging, min]);

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative mt-2 flex w-full touch-none select-none items-center py-2 pt-6",
          className,
        )}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        value={value}
        min={localMin}
        max={localMax}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-4 w-full grow overflow-hidden rounded-full bg-secondary">
          {referenceValuePositionPercent !== undefined && (
            <motion.div
              className="absolute h-full bg-purple-500/15"
              animate={{
                left: `${referenceValuePositionPercent}%`,
                right: "0",
              }}
            />
          )}
          <span className="absolute left-1 z-0 text-xs text-muted-foreground">{`${localMin < 0 ? "-" : ""}${symbol ?? ""}${Math.abs(localMin).toFixed(1)}`}</span>
          <span className="absolute right-1 z-0 text-xs text-muted-foreground">{`${localMax < 0 ? "-" : ""}${symbol ?? ""}${Math.abs(localMax).toFixed(1)}`}</span>
        </SliderPrimitive.Track>
        {referenceValue !== undefined &&
          referenceValuePositionPercent !== undefined && (
            <>
              <motion.div
                animate={{
                  top: 2,
                  left: `calc(${referenceValuePositionPercent}% - calc(${REFERENCE_POINT_SIZE}/2))`,
                  scale: Math.max(
                    VALUATION_AMPLITUDE /
                      (VALUATION_AMPLITUDE + Math.abs(referenceDistance)),
                    0.2,
                  ),
                  rotate: 45,
                }}
                transition={{
                  top: {
                    ease:
                      referenceValuePositionPercent >= 0 &&
                      referenceValuePositionPercent <= 100
                        ? "easeOut"
                        : "easeIn",
                  },
                }}
                className={cn(`absolute bg-purple-500`)}
                style={{
                  width: REFERENCE_POINT_SIZE,
                  height: REFERENCE_POINT_SIZE,
                }}
              />
              <motion.span
                animate={{
                  top: 1,
                  left:
                    referenceDistance > 0
                      ? "auto"
                      : `calc(${referenceValuePositionPercent}% + ${REFERENCE_POINT_SIZE})`,
                  right:
                    referenceDistance > 0
                      ? `calc(${100 - referenceValuePositionPercent}% + ${REFERENCE_POINT_SIZE})`
                      : "auto",
                }}
                className={cn(
                  "absolute w-fit whitespace-nowrap text-xs leading-none text-purple-500",
                )}
              >
                mean{" "}
                {`${referenceValue < 0 ? "-" : ""}${symbol ?? ""}${Math.abs(referenceValue).toFixed(1)}`}
              </motion.span>
            </>
          )}
        {children}
        <MotionThumb
          layout={isDragging ? false : true}
          className={cn(
            `relative z-30 block size-8 rounded-full bg-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`,
          )}
        >
          <div
            className={cn(
              "absolute -left-10 -right-10 -top-7 mx-auto hidden w-fit rounded-sm border bg-background px-2 text-sm opacity-85 shadow-sm",
              isDragging && "block",
            )}
          >
            {`${value![0] < 0 ? "-" : ""}${symbol ?? ""}${Math.abs(value![0]).toFixed(1)}`}
          </div>
        </MotionThumb>
      </SliderPrimitive.Root>
    );
  },
);
