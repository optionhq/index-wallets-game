import { currenciesAtom } from "@/components/Game.state";
import { tokenColor } from "@/config";
import { bn, bnMath } from "@/lib/bnMath";
import { cn } from "@/lib/cn";
import { useAtomValue } from "jotai";
import { BigNumber } from "mathjs";
import { FC, HTMLAttributes, useMemo } from "react";

export interface BalancesDonutProps extends HTMLAttributes<HTMLDivElement> {
  balances: BigNumber[];
}
export const BalancesDonut: FC<BalancesDonutProps> = ({
  className,
  balances,
  ...props
}) => {
  const currencies = useAtomValue(currenciesAtom);
  const total = bnMath.sum(balances);
  const data = useMemo(
    () =>
      currencies.reduce(
        (data, currency, i) => {
          const start = data.length ? data[data.length - 1].stop : 0;
          const stop =
            start + (balances[i] ?? bn(0)).div(total).mul(360).toNumber();
          const color = tokenColor[currency.symbol];
          return [...data, { start, stop, color }];
        },
        [] as { start: number; stop: number; color: string }[],
      ),
    [balances, total, currencies],
  );
  return (
    <div
      className={cn("p-1 rounded-full", className)}
      style={{
        background: `conic-gradient(${data.map((currency) => `${currency.color} ${currency.start}deg ${currency.stop}deg `)})`,
      }}
      {...props}
    />
  );
};
