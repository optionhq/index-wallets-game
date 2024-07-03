import {
  currenciesAtom,
  currentPlayerAtom,
  emitEventAtom,
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
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";

export const ValuationsTab = () => {
  const [provisionalValuations, setProvisionalValuations] = useAtom(
    playerProvisionalValuationsAtom,
  );
  const [valuations, setValuations] = useAtom(playerValuationsAtom);
  const emitEvent = useSetAtom(emitEventAtom);
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
    <TabsContent value="valuations">
      <div className="flex flex-col gap-2 ">
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
      <div className="sticky -bottom-6 bg-background -m-4 mt-6 px-4 py-2 z-10 border-t transition-[height]">
        <div className="flex justify-between items-center h-8">
          <h2 className="text-lg font-bold text-muted-foreground ">
            Price multipliers
          </h2>

          <Button
            disabled={!valuationsHaveChanged}
            className="h-fit p-0 transition-opacity disabled:opacity-0"
            variant="link"
            onClick={() => setProvisionalValuations(valuations)}
          >
            Reset
          </Button>

          <Button
            disabled={!valuationsHaveChanged}
            size={"sm"}
            className="transition-opacity disabled:opacity-0"
            onClick={async () => {
              setValuations(provisionalValuations).then(() => {
                emitEvent({
                  type: "VALUATIONS_UPDATED",
                  playerId: currentPlayer.deviceId,
                  valuations: provisionalValuations,
                });
              });
            }}
          >
            Update
          </Button>
        </div>
        <h3 className="text-xs text-muted-foreground leading-none mt-4">
          When purchasing from others
        </h3>
        <div className="bg-green-50 h-4 w-full relative rounded-t-sm mt-2 shrink-0">
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
          {maxRelativePurchasePriceIndex > 1.1 && (
            <span className="absolute text-xs -right-3 my-1 bottom-2">
              x{maxRelativePurchasePriceIndex.toFixed(2)}
            </span>
          )}
        </div>

        <div className="bg-blue-50 h-4 w-full relative rounded-b-sm mt-[1px] shrink-0">
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

          {maxRelativeSalePriceIndex > 1.1 && (
            <span className="absolute text-xs -right-3 my-1 top-2">
              x{maxRelativeSalePriceIndex.toFixed(2)}
            </span>
          )}
        </div>
        <h3 className="text-xs text-muted-foreground leading-none mt-2">
          When others purchase from you
        </h3>
      </div>
    </TabsContent>
  );
};
