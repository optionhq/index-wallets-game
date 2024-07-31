import {
  currenciesAtom,
  currentAgentAtom,
  emitEventAtom,
  playerProvisionalValuationsAtom,
  playerValuationsAtom,
} from "@/components/Game.state";
import { CurrencyValuation } from "@/components/tabs/Valuations/CurrencyValuation";
import { ProfitabilityChart } from "@/components/tabs/Valuations/ProfitabilityChart";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";

export const ValuationsTab = () => {
  const [provisionalValuations, setProvisionalValuations] = useAtom(
    playerProvisionalValuationsAtom,
  );
  const [valuations, setValuations] = useAtom(playerValuationsAtom);
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

      <div className="sticky -bottom-6 bg-background -m-6 mt-4 px-4 py-2 z-10 border-t transition-[height]">
        <Button
          disabled={!valuationsHaveChanged}
          size={"sm"}
          className="absolute -top-6 left-0 transition-opacity disabled:opacity-0 z-20 rounded-l-none w-20 h-12 text-primary shadow-md"
          variant="outline"
          onClick={() => setProvisionalValuations(valuations)}
        >
          Reset
        </Button>

        <Button
          disabled={!valuationsHaveChanged}
          size={"sm"}
          className="absolute -top-6 right-0 transition-opacity disabled:opacity-0 z-20  rounded-r-none w-20 h-12 shadow-md"
          onClick={async () => {
            setValuations(provisionalValuations).then(() => {
              emitEvent({
                type: "VALUATIONS_UPDATED",
                playerId: currentPlayer.deviceId,
                newValuations: provisionalValuations,
                oldValuations: valuations,
                playerName: currentPlayer.name,
              });
            });
          }}
        >
          Update
        </Button>
        <h3 className="text-xs text-muted-foreground w-full text-center leading-none mb-2">
          Items you can buy by selling 1 item
        </h3>
        <ProfitabilityChart />
      </div>
    </TabsContent>
  );
};
