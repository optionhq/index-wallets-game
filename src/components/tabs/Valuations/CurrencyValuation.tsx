import {
  currenciesAtom,
  currentPlayerAtom,
  otherPlayersAtom,
} from "@/components/Game.state";
import { ValuationSlider } from "@/components/ValuationSlider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VALUATION_AMPLITUDE } from "@/config";
import { bn, bnMath } from "@/lib/bnMath";
import { cn } from "@/lib/cn";
import { useAtomValue } from "jotai";
import { BigNumber } from "mathjs";
import { FC, HTMLAttributes, useMemo } from "react";
import { groupBy, sortBy } from "remeda";

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
  const otherPlayers = useAtomValue(otherPlayersAtom);
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const currencies = useAtomValue(currenciesAtom);
  const currency = currencies[currencyIndex];
  const playersGroupedByValuation = useMemo(
    () =>
      sortBy(
        Object.entries(
          groupBy([...otherPlayers, currentPlayer], (player) =>
            player.deviceId === currentPlayer.deviceId
              ? valuation.toFixed(1)
              : player.valuations[currencyIndex].toFixed(1),
          ),
        ),
        ([valuation]) => Number(valuation),
      ),
    [otherPlayers, currentPlayer, valuation, currencyIndex],
  );
  return (
    <div {...props} className="grid col-span-3 grid-cols-subgrid pt-4 gap-6">
      <p className="text-right">{currency.symbol}</p>

      <ValuationSlider
        value={[valuation.toNumber()]}
        onValueChange={([value]) => setValuation(bn(value))}
        min={-VALUATION_AMPLITUDE}
        max={VALUATION_AMPLITUDE}
        step={0.1}
        className="pb-8"
      >
        <span className="absolute bg-black/20 w-[2px] h-6 ml-[1px] left-1/2" />
        {playersGroupedByValuation.map(([playerValuation, players]) =>
          players.map((player, i) => (
            <span
              key={`${player.deviceId}-marker`}
              className={cn(
                "absolute mb-2",
                player.deviceId === currentPlayer.deviceId && "z-10",
              )}
              style={{
                left: `${(100 * (Number(playerValuation) + VALUATION_AMPLITUDE)) / (2 * VALUATION_AMPLITUDE)}%`,
              }}
            >
              {/* <span
                className="absolute"
                style={{ top: `${-30 - 4 * (players.length - i)}px` }}
              >
                <span
                  className={cn(
                    player.deviceId === currentPlayer.deviceId
                      ? "bg-primary"
                      : "bg-muted-foreground",
                    "absolute size-10 m-[-20px] rotate-45 rounded-t-full border-white  rounded-bl-full transition-[top] duration-500",
                  )}
                ></span>
                <PlayerToken className="absolute size-[40px] m-[-20px] rounded-full" />
              </span> */}
              <span
                className={cn(
                  player.deviceId === currentPlayer.deviceId
                    ? "bg-primary"
                    : "bg-muted-foreground",
                  "absolute size-2 mx-[-2px] rounded-full ",
                )}
                //   style={{ top: `${-10 + 4 * i}px` }}
              />
            </span>
          )),
        )}
      </ValuationSlider>

      <div className="flex flex-col gap-2">
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
  );
};
