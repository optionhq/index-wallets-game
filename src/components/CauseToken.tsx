import { cn } from "@/lib/cn";
import { FC, HTMLAttributes } from "react";

export interface CauseTokenProps extends HTMLAttributes<HTMLDivElement> {}
export const CauseToken: FC<CauseTokenProps> = ({ className, ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        "flex items-center justify-center size-[40px] border-2 bg-muted rounded-full",
        className,
      )}
    ></div>
  );
};
