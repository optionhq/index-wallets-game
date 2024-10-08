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
import { WalletCompositionsChart } from "@/components/tabs/Market/WalletCompositionsChart";
import { CurrencyValuation } from "@/components/tabs/Storefront/CurrencyValuation";
import { PricingChart } from "@/components/tabs/Storefront/PricingChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { bn } from "@/lib/bnMath";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MinusIcon, PlusIcon, TargetIcon } from "lucide-react";
import { useMemo, useState } from "react";

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

  const [targetingEnabled, setTargetingEnabled] = useState(false);

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
    <TabsContent value="storefront" className="relative p-0">
      <AnimatePresence>
        {targetingEnabled && (
          <motion.div
            className="absolute left-0 z-50 flex w-full flex-col items-center gap-1 bg-background p-2 shadow-md"
            initial={{ top: -200 }}
            animate={{ top: 0 }}
            exit={{ top: -200 }}
          >
            <p className="text-center text-xs text-muted-foreground">
              Wallet compositions
            </p>
            <WalletCompositionsChart height={120} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-grow flex-col gap-2 overflow-auto p-4 pb-14">
        <Label htmlFor="price" className="text-center text-muted-foreground">
          Your price
        </Label>
        <div className="flex flex-col gap-2 px-4">
          <div className="mt-1 flex items-center justify-center gap-2">
            <div className="relative inline-block">
              <span className="absolute left-5 top-2.5 h-4 align-middle text-lg">
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
                className="h-12 w-32 place-self-center rounded-3xl text-center text-lg"
              />
            </div>
            <div className="flex gap-px">
              <Button
                size="icon"
                className="size-10 rounded-l-full"
                variant={"secondary"}
                onClick={() => setProvisionalPrice(provisionalPrice.sub(0.1))}
                onContextMenu={(e) => e.preventDefault()}
              >
                <MinusIcon className="size-4" />
              </Button>
              <Button
                size={"icon"}
                className="size-10 rounded-sm rounded-r-full"
                variant={"secondary"}
                onClick={() => setProvisionalPrice(provisionalPrice.add(0.1))}
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>
          </div>
          <InfiniteSlider
            value={[provisionalPrice.toNumber()]}
            onValueChange={([value]) => setProvisionalPrice(bn(value))}
            min={0}
            // max={VALUATION_AMPLITUDE}
            step={0.1}
            symbol="ⱡ"
          >
            {/* <span className="absolute -top-0.5 bg-black/20 w-px h-9 left-[calc(50%-0.5px)]" /> */}
          </InfiniteSlider>
        </div>
        <h2 className="mt-5 text-lg font-bold leading-none text-muted-foreground">
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
      <PricingChart className={"border-t px-2 pb-2 pt-4 shadow-2xl"}>
        <>
          <Button
            disabled={!hasPendingUpdates}
            size={"sm"}
            className="absolute -top-2 left-0 z-20 h-10 w-20 rounded-l-none text-primary shadow-md transition-opacity disabled:opacity-0"
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
            className="absolute -top-2 right-0 z-20 h-10 w-20 rounded-r-none shadow-md transition-opacity disabled:opacity-0"
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
          <Button
            size="icon"
            variant={"outline"}
            onPointerDown={() => setTargetingEnabled(true)}
            onPointerUp={() => setTargetingEnabled(false)}
            onContextMenu={(e) => e.preventDefault()}
            className="absolute -top-16 right-1 size-12 rounded-full p-1 text-primary shadow-md hover:bg-background hover:text-primary active:bg-muted active:text-primary/80"
          >
            <TargetIcon className="size-full" />
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
