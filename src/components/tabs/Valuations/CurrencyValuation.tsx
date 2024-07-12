import { CharacterBadge } from "@/components/CharacterBadge";
import {
  currenciesAtom,
  currentAgentAtom,
  playersAtom,
} from "@/components/Game.state";
import { TokenBadge } from "@/components/TokenBadge";
import { ValuationSlider } from "@/components/ValuationSlider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VALUATION_AMPLITUDE } from "@/config";
import { bn, bnMath } from "@/lib/bnMath";
import { cn } from "@/lib/cn";
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
  const currentPlayer = useAtomValue(currentAgentAtom);
  const players = useAtomValue(playersAtom);
  const currencies = useAtomValue(currenciesAtom);
  const currency = currencies[currencyIndex];

  return (
    <div {...props} className="flex pt-4 gap-6">
      <div className="flex flex-col flex-grow gap-2">
        <div className="flex justify-between">
          <div className="flex items-center h-fit gap-2">
            <TokenBadge token={currency.symbol} className="size-8 shrink-0" />
            <p className="text-right font-medium">{currency.symbol}</p>
          </div>

          <div className="flex gap-2">
            <Input
              className="w-16 h-8 text-right"
              maxLength={4}
              type="number"
              inputMode="decimal"
              value={valuation.toFixed(1)}
              onChange={(e) => setValuation(bn(e.target.value))}
            />
            <div className="flex gap-[1px]">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-l-full size-8"
                onClick={() => {
                  setValuation(bnMath.subtract(valuation, 0.1) as BigNumber);
                }}
              >
                -
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-r-full size-8"
                onClick={() => {
                  setValuation(bnMath.add(valuation, 0.1) as BigNumber);
                }}
              >
                +
              </Button>
            </div>
          </div>
        </div>
        <ValuationSlider
          value={[valuation.toNumber()]}
          onValueChange={([value]) => setValuation(bn(value))}
          min={-VALUATION_AMPLITUDE}
          max={VALUATION_AMPLITUDE}
          step={0.1}
          className="pb-8"
        >
          <span className="absolute bg-black/20 w-px h-9 left-[calc(50%-0.5px)]" />
          {players.map((player) => {
            const SIZE = 25;
            const MARGIN = 3;
            const playerValuation = player.isCurrentPlayer
              ? valuation.toNumber()
              : player.valuations[currencyIndex].toNumber();
            const percentage =
              (playerValuation + VALUATION_AMPLITUDE) /
              (2 * VALUATION_AMPLITUDE);
            return (
              <CharacterBadge
                key={`${player.deviceId}-marker`}
                character={player.character}
                className={cn(
                  "absolute p-0.5 mt-px",
                  player.isCurrentPlayer && "z-10",
                )}
                style={{
                  width: SIZE,
                  height: SIZE,
                  left: `calc(${100 * percentage}% + ${(SIZE + MARGIN) / 2 - (SIZE + MARGIN) * percentage}px)`,
                  transform: "var(--radix-slider-thumb-transform)",
                }}
              />
            );
          })}
        </ValuationSlider>
      </div>
    </div>
  );
};
