import {
  currenciesAtom,
  currentAgentAtom,
  emitEventAtom,
  playerPriceAtom,
  playerProvisionalPriceAtom,
  playerProvisionalValuationsAtom,
  playerValuationsAtom,
} from "@/components/Game.state";
import { InfiniteSlider } from "@/components/InfiniteSlider";
import { CurrencyValuation } from "@/components/tabs/Storefront/CurrencyValuation";
import { PricingChart } from "@/components/tabs/Storefront/PricingChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { bn } from "@/lib/bnMath";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useMemo } from "react";

export const StorefrontTab = () => {
  const [provisionalValuations, setProvisionalValuations] = useAtom(
    playerProvisionalValuationsAtom,
  );
  const [provisionalPrice, setProvisionalPrice] = useAtom(
    playerProvisionalPriceAtom,
  );
  const [valuations, setValuations] = useAtom(playerValuationsAtom);
  const [price, setPrice] = useAtom(playerPriceAtom);
  const emitEvent = useSetAtom(emitEventAtom);
  const currencies = useAtomValue(currenciesAtom);
  const currentPlayer = useAtomValue(currentAgentAtom);

  const valuationsHaveChanged = useMemo(
    () =>
      valuations.some(
        (oldValuation, i) => !provisionalValuations[i].eq(oldValuation),
      ),
    [valuations, provisionalValuations],
  );

  const priceHasChanged = !provisionalPrice.eq(price);

  const hasPendingUpdates = valuationsHaveChanged || priceHasChanged;

  return (
    <TabsContent value="storefront" className="p-0">
      <div className="flex-grow flex flex-col gap-2 overflow-auto p-4 ">
        <Label htmlFor="price" className="text-center text-muted-foreground">
          Your price
        </Label>
        <div className="flex flex-col gap-2 px-4">
          <div className="flex justify-center items-center gap-1 mt-1">
            <div className="relative inline-block">
              <span className="absolute text-lg align-middle left-5  top-2.5 h-4">
                ⱡ
              </span>
              <Input
                maxLength={6}
                max={100}
                value={provisionalPrice.toFixed(1)}
                onChange={(event) =>
                  setProvisionalPrice(bn(event.target.value))
                }
                pattern="^\d+.\d*$"
                step={0.1}
                id="price"
                type="number"
                className="place-self-center w-32 h-12 text-center rounded-3xl  text-lg"
              />
            </div>
            <Button
              size="icon"
              className="size-12 rounded-l-full"
              variant={"secondary"}
              onClick={() => setProvisionalPrice(provisionalPrice.sub(0.1))}
              onContextMenu={(e) => e.preventDefault()}
            >
              <MinusIcon />
            </Button>
            <Button
              size={"icon"}
              className="size-12 rounded-sm rounded-r-full"
              variant={"secondary"}
              onClick={() => setProvisionalPrice(provisionalPrice.add(0.1))}
            >
              <PlusIcon />
            </Button>
          </div>
          <InfiniteSlider
            value={[provisionalPrice.toNumber()]}
            onValueChange={([value]) => setProvisionalPrice(bn(value))}
            min={0}
            // max={VALUATION_AMPLITUDE}
            step={0.1}
          >
            <span className="absolute -top-0.5 bg-black/20 w-px h-9 left-[calc(50%-0.5px)]" />
          </InfiniteSlider>
        </div>
        <h2 className="text-lg font-bold text-muted-foreground leading-none mt-5">
          Your Valuations
        </h2>
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
      <PricingChart className={"px-2 pb-2 pt-4 shadow-2xl border-t"}>
        <>
          <Button
            disabled={!hasPendingUpdates}
            size={"sm"}
            className="absolute -top-[16px] left-0 transition-opacity disabled:opacity-0 z-20 rounded-l-none w-20 h-12 text-primary shadow-md"
            variant="outline"
            onClick={() => {
              setProvisionalValuations(valuations);
              setProvisionalPrice(price);
            }}
          >
            Reset
          </Button>

          <Button
            disabled={!hasPendingUpdates}
            size={"sm"}
            className="absolute -top-[16px] right-0 transition-opacity disabled:opacity-0 z-20  rounded-r-none w-20 h-12 shadow-md"
            onClick={async () => {
              valuationsHaveChanged &&
                setValuations(provisionalValuations).then(() => {
                  emitEvent({
                    type: "VALUATIONS_UPDATED",
                    playerId: currentPlayer.deviceId,
                    newValuations: provisionalValuations,
                    oldValuations: valuations,
                    playerName: currentPlayer.name,
                  });
                });
              priceHasChanged &&
                setPrice(provisionalPrice).then(() => {
                  emitEvent({
                    type: "PRICE_UPDATED",
                    playerId: currentPlayer.deviceId,
                    playerName: currentPlayer.name,
                    newPrice: provisionalPrice,
                    oldPrice: price,
                  });
                });
            }}
          >
            Update
          </Button>
        </>
      </PricingChart>

      {/* <div className="sticky -bottom-6 bg-background -m-6 mt-4 px-4 py-2 z-10 border-t transition-[height]"> */}

      {/* <h3 className="text-xs text-muted-foreground w-full text-center leading-none mb-2">
          Items you can buy by selling 1 item
        </h3>
        <ProfitabilityChart /> */}
      {/* </div> */}
    </TabsContent>
  );
};
