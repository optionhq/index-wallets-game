import { tokenColor, tokenIcon } from "@/config";
import { cn } from "@/lib/cn";
import { CauseSymbol } from "@/types/Cause";
import { FC, HTMLAttributes } from "react";

export interface CauseTokenProps extends HTMLAttributes<HTMLDivElement> {
  token: CauseSymbol | "USD";
  withoutIcon?: boolean;
  classNames?: {
    icon?: string;
  };
}
export const TokenBadge: FC<CauseTokenProps> = ({
  className,
  token,
  withoutIcon = false,
  classNames,
  style,
  ...props
}) => {
  const Icon = tokenIcon[token];
  return (
    <div
      {...props}
      className={cn(
        "flex items-center justify-center size-[40px] text-white rounded-full",
        className,
      )}
      style={{ backgroundColor: tokenColor[token], ...style }}
    >
      {!withoutIcon && Icon && (
        <Icon className={cn("size-8/12", classNames?.icon)} />
      )}
    </div>
  );
};
