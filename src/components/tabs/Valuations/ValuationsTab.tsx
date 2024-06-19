import {
  currenciesAtom,
  currentPlayerAtom,
  otherPlayersAtom,
  playerProvisionalValuationsAtom,
  playerValuationsAtom,
  playersAtom,
  purchaseRelativePriceIndexesAtom,
} from "@/components/Game.state";
import { CurrencyValuation } from "@/components/tabs/Valuations/CurrencyValuation";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";
import { relativePriceIndex } from "@/lib/indexWallets/relativePriceIndex";
import { useAtom, useAtomValue } from "jotai";
import { useMemo } from "react";
import { toast } from "sonner";

export const ValuationsTab = () => {
  const [provisionalValuations, setProvisionalValuations] = useAtom(
    playerProvisionalValuationsAtom,
  );
  const [valuations, setValuations] = useAtom(playerValuationsAtom);
  const otherPlayers = useAtomValue(otherPlayersAtom);
  const currencies = useAtomValue(currenciesAtom);
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const players = useAtomValue(playersAtom);

  const purchaseRelativePriceIndexes = useAtomValue(
    purchaseRelativePriceIndexesAtom,
  );

  const saleRelativePriceIndexes = useMemo(() => {
    return players.map((player) =>
      relativePriceIndex({
        buyerBalances: player.balances,
        vendorValuations: provisionalValuations,
        viewerValuations:
          player.deviceId === currentPlayer.deviceId
            ? provisionalValuations
            : player.valuations,
      }),
    );
  }, [players, currentPlayer.deviceId, provisionalValuations]);

  const maxRelativePurchasePriceIndex = useMemo(
    () =>
      Math.max(
        ...Object.values(purchaseRelativePriceIndexes).map((index) =>
          index.toNumber(),
        ),
      ),
    [purchaseRelativePriceIndexes],
  );

  const maxRelativeSalePriceIndex = useMemo(
    () =>
      Math.max(...saleRelativePriceIndexes.map((index) => index.toNumber())),
    [saleRelativePriceIndexes],
  );

  const valuationsHaveChanged = useMemo(
    () =>
      valuations.some(
        (oldValuation, i) => !provisionalValuations[i].eq(oldValuation),
      ),
    [valuations, provisionalValuations],
  );

  return (
    <TabsContent
      value="valuations"
      className="flex flex-col flex-grow  py-1 px-4 overflow-auto"
    >
      <h2 className="text-lg font-bold text-muted-foreground leading-none">
        Valuations
      </h2>
      <div className="grid grid-cols-[auto_1fr_auto] gap-2  divide-y-2">
        {currencies.map((currency, currencyIndex) => {
          if (currency.symbol === "USD") return;
          return (
            <CurrencyValuation
              key={currency.symbol}
              currencyIndex={currencyIndex}
              valuation={provisionalValuations[currencyIndex]}
              setValuation={(valuation) => {
                const next = [...provisionalValuations];
                next[currencyIndex] = valuation;
                setProvisionalValuations(next);
              }}
            />
          );
        })}
      </div>
      <h2 className="text-lg font-bold text-muted-foreground leading-none mt-10">
        Relative purchase power
      </h2>
      <h3 className="text-sm text-muted-foreground leading-none mt-4">
        Price multiplier when purchasing from them
      </h3>
      <div className="bg-green-50 h-4 w-full relative rounded-t-sm mt-4">
        {[...otherPlayers, currentPlayer].map((player) => (
          <span
            key={`${player.deviceId}-relative-purchase`}
            className={cn(
              player.deviceId === currentPlayer.deviceId
                ? "bg-primary"
                : "bg-muted-foreground",
              "absolute size-2 mx-[-4px] rounded-full my-1 transition-[left]",
            )}
            style={{
              left: `${(100 * purchaseRelativePriceIndexes[player.deviceId].toNumber()) / maxRelativePurchasePriceIndex}%`,
            }}
          >
            {player.deviceId === currentPlayer.deviceId && (
              <span className="absolute text-xs left-0 bottom-2 mx-[-2px]">
                x1
              </span>
            )}
          </span>
        ))}
        <span className="absolute text-xs -right-3 my-1 bottom-2">
          x{maxRelativePurchasePriceIndex.toFixed(2)}
        </span>
      </div>

      <div className="bg-purple-50 h-4 w-full relative rounded-b-sm mt-[1px]">
        {[...otherPlayers, currentPlayer].map((player, i) => (
          <span
            key={`${player.deviceId}-relative-sale`}
            className={cn(
              player.deviceId === currentPlayer.deviceId
                ? "bg-primary"
                : "bg-muted-foreground",
              "absolute size-2 mx-[-4px] rounded-full my-1 transition-[left]",
            )}
            style={{
              left: `${(100 * saleRelativePriceIndexes[i].toNumber()) / maxRelativeSalePriceIndex}%`,
            }}
          >
            {player.deviceId === currentPlayer.deviceId && (
              <span className="absolute text-xs left-0 top-2 mx-[-2px]">
                x1
              </span>
            )}
          </span>
        ))}

        <span className="absolute text-xs -right-3 my-1 top-2">
          x{maxRelativeSalePriceIndex.toFixed(2)}
        </span>
      </div>
      <h3 className="text-sm text-muted-foreground leading-none mt-4">
        Price multiplier when they purchase from you
      </h3>
      {valuationsHaveChanged && (
        <div className="flex justify-end bottom-0 mt-8">
          <Button
            variant="link"
            onClick={() => setProvisionalValuations(valuations)}
          >
            Reset
          </Button>
          <Button
            onClick={async () => {
              setValuations(provisionalValuations).then(() =>
                toast.success("Valuations updated"),
              );
            }}
          >
            Update valuations
          </Button>
        </div>
      )}
    </TabsContent>
  );
};
