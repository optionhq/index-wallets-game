import { currenciesAtom, networkValuationsAtom } from "@/components/Game.state";
import { InfiniteSlider } from "@/components/InfiniteSlider";
import { TokenBadge } from "@/components/TokenBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bn, bnMath } from "@/lib/bnMath";
import { useAtomValue } from "jotai";
import { BigNumber } from "mathjs";
import { FC, HTMLAttributes } from "react";

export interface CurrencyValuationProps extends HTMLAttributes<HTMLDivElement> {
  currencyIndex: number;
  valuation: BigNumber;
  setValuation: (valuation: BigNumber) => void;
}

export const CurrencyValuation: FC<CurrencyValuationProps> = ({
  currencyIndex,
  valuation,
  setValuation,
  ...props
}) => {
  const currencies = useAtomValue(currenciesAtom);
  const currency = currencies[currencyIndex];
  const networkValuations = useAtomValue(networkValuationsAtom);

  return (
    <div {...props} className="flex gap-6 p-2 px-6 pt-4">
      <div className="flex flex-grow flex-col gap-2">
        <div className="flex justify-between">
          <div className="flex h-fit items-center gap-2">
            <TokenBadge token={currency.symbol} className="size-8 shrink-0" />
            <p className="text-right font-medium">{currency.symbol}</p>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col">
              <Input
                className="h-8 w-20 text-right"
                maxLength={5}
                type="number"
                inputMode="decimal"
                value={valuation.toFixed(1)}
                onChange={(e) => setValuation(bn(e.target.value))}
              />
            </div>
            <div className="flex gap-[1px]">
              <Button
                variant="secondary"
                size="icon"
                className="size-8 rounded-l-full"
                onClick={() => {
                  setValuation(bnMath.subtract(valuation, 0.1) as BigNumber);
                }}
              >
                -
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="size-8 rounded-r-full"
                onClick={() => {
                  setValuation(bnMath.add(valuation, 0.1) as BigNumber);
                }}
              >
                +
              </Button>
            </div>
          </div>
        </div>
        <InfiniteSlider
          value={[valuation.toNumber()]}
          onValueChange={([value]) => setValuation(bn(value))}
          referenceValue={(
            networkValuations[currencyIndex] ?? bn(0)
          ).toNumber()}
          // min={-VALUATION_AMPLITUDE}
          // max={VALUATION_AMPLITUDE}
          step={0.1}
        >
          {/* <span className="absolute -top-0.5 bg-black/20 w-px h-9 left-[calc(50%-0.5px)]" /> */}
        </InfiniteSlider>
      </div>
    </div>
  );
};
