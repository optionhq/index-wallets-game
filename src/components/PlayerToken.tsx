import { cn } from "@/lib/cn";
import { FC, HTMLAttributes } from "react";

export interface PlayerTokenProps extends HTMLAttributes<HTMLDivElement> {}
export const PlayerToken: FC<PlayerTokenProps> = ({ className, ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        "flex items-center justify-center size-[40px] border-2 bg-muted rounded-full",
        className
      )}
    ></div>
  );
};
