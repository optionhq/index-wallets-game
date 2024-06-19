import { CauseToken } from "@/components/CauseToken";
import {
  activeTabAtom,
  causesAtom,
  currentPlayerAtom,
  gameAtom,
} from "@/components/Game.state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Currency } from "@/types/Currency";
import { TabsContent } from "@radix-ui/react-tabs";
import { useAtomValue, useSetAtom } from "jotai";
import { HeartHandshakeIcon, Undo2Icon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export const CausesTab = () => {
  const [selectedCause, setSelectedCause] = useState<Currency | undefined>(
    undefined,
  );
  const causes = useAtomValue(causesAtom);
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const setActiveTab = useSetAtom(activeTabAtom);
  const updateGame = useSetAtom(gameAtom);
  const hasEnoughFunds = useMemo(
    () => currentPlayer.balances[0].greaterThanOrEqualTo(20),
    [currentPlayer],
  );

  const makeDonation = useCallback(() => {
    if (!selectedCause) return;

    setSelectedCause(undefined);
    setActiveTab("wallet");

    updateGame((game) => {
      const currencyIndex = game.currencies.findIndex(
        (currency) => currency.symbol === selectedCause.symbol,
      )!;
      const currentPlayerState = game.players.find(
        (player) => player.deviceId === currentPlayer.deviceId,
      )!;

      const usdBalance = currentPlayerState.balances[0];

      const causeTokenBalance = currentPlayerState.balances[currencyIndex];

      game.players.find(
        (player) => player.deviceId === currentPlayer.deviceId,
      )!.balances[0] = usdBalance.sub(20);

      game.players.find(
        (player) => player.deviceId === currentPlayer.deviceId,
      )!.balances[currencyIndex] = causeTokenBalance.add(20);
    }).then(() => {
      toast.success("Donation successful", {
        description: `Donated U$20 to ${selectedCause.name} and got 20 ${selectedCause.symbol} in return.`,
      });
    });
  }, [currentPlayer, selectedCause, updateGame]);

  return (
    <TabsContent value="causes">
      {!selectedCause && (
        <>
          <h2 className="text-lg font-bold text-muted-foreground leading-none">
            Donate to a cause
          </h2>
          <div className="flex flex-col gap-2 mt-4">
            {causes.map((cause) => {
              const isPlayerCause = currentPlayer.cause === cause.symbol;
              return (
                <div
                  onClick={() => setSelectedCause(cause)}
                  key={cause.symbol}
                  className={cn(
                    "relative flex items-center border-2 cursor-pointer p-2 gap-2 shadow-sm rounded-lg hover:border-primary",
                  )}
                >
                  <CauseToken className="size-16" />
                  <div className="flex flex-col gap-0">
                    <p className="font-bold text-lg">{cause.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <strong>
                        {20} {cause.symbol}
                      </strong>{" "}
                      for <strong>U$20</strong>
                    </p>
                  </div>
                  {isPlayerCause && (
                    <HeartHandshakeIcon className="absolute top-3 right-3 text-primary" />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      {selectedCause && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2"
            onClick={() => setSelectedCause(undefined)}
          >
            <Undo2Icon />
          </Button>

          <p className="font-bold text-xl text-muted-foreground absolute top-4 left-0 right-0 mx-auto w-fit">
            Donating to
          </p>

          <div className="flex flex-col items-center border-2 mt-4 p-6 shadow-sm rounded-lg">
            <CauseToken className="size-32" />
            <div className="flex flex-col gap-0">
              <p className="font-bold text-xl">{selectedCause.name}</p>
            </div>
          </div>

          {/* <div className="flex flex-col items-center justify-center mt-6">
            <Label
              htmlFor="vendor-price"
              className="text-center text-muted-foreground"
            >
              Paying
            </Label>
            <div className="relative inline-block">
              <span className="absolute left-3 top-1/2  -my-3 text-gray-500 text-lg">
                $
              </span>
              <Input
                maxLength={6}
                max={100}
                value={vendorPriceInput}
                onChange={(event) => setVendorPriceInput(event.target.value)}
                type="number"
                step={0.01}
                pattern="^\d+(\.\d{1,2})?$"
                id="vendor-price"
                inputMode="decimal"
                className="place-self-center w-32 h-12 mt-1 text-center  text-lg"
              />
            </div>

            {balanceAfterPurchase && (
              <div className="grid grid-cols-3 mt-4">
                <div className="flex items-center flex-col text-muted-foreground/60">
                  <Label className="mt-4 ">Initial balance</Label>
                  <p className="mt-2 text-lg font-bold ">
                    {"$" + portfolioValue.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center flex-col">
                  <Label className="mt-4 text-md text-muted-foreground">
                    You pay
                  </Label>
                  <p className="mt-2 text-xl font-bold text-muted-foreground">
                    {!buyerPrice ? "---" : "$" + buyerPrice.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center flex-col text-muted-foreground/60">
                  <Label className="mt-4 ">You'll have</Label>
                  <p
                    className={cn(
                      "mt-2 text-lg font-bold",
                      balanceAfterPurchase.isNegative() && "text-destructive",
                    )}
                  >
                    {formatValue(balanceAfterPurchase, {
                      withDollarSign: true,
                    })}
                  </p>
                </div>
              </div>
            )}
          </div> */}
          <div className="mt-14 flex flex-col items-center">
            {hasEnoughFunds === false && (
              <p className="text-destructive">Not enough funds</p>
            )}
            {hasEnoughFunds && (
              <Button
                onClick={makeDonation}
                className="font-bold w-full text-lg h-14"
              >
                Donate
              </Button>
            )}
          </div>
        </>
      )}
    </TabsContent>
  );
};
