import { causeIcon, tokenColor } from "@/config";
import { cn } from "@/lib/cn";
import { CurrencySymbol } from "@/types/Currency";
import { FC, HTMLAttributes } from "react";

export interface CauseTokenProps extends HTMLAttributes<HTMLDivElement> {
  token: CurrencySymbol;
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
  const Icon = causeIcon[token];
  return (
    <div
      {...props}
      className={cn(
        "flex size-[40px] items-center justify-center rounded-full text-white",
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
