import {
  activeTabAtom,
  causesAtom,
  currentPlayerAtom,
  emitEventAtom,
  gameAtom,
} from "@/components/Game.state";
import { TokenBadge } from "@/components/TokenBadge";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { DONATION_PRICE, DONATION_REWARD } from "@/config";
import { bn } from "@/lib/bnMath";
import { cn } from "@/lib/cn";
import { CauseSymbol } from "@/types/Cause";
import { Currency } from "@/types/Currency";
import { useAtomValue, useSetAtom } from "jotai";
import { HeartHandshakeIcon, Undo2Icon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export const CausesTab = () => {
  const [selectedCause, setSelectedCause] = useState<Currency | undefined>(
    undefined,
  );
  const causes = useAtomValue(causesAtom);
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const setActiveTab = useSetAtom(activeTabAtom);
  const updateGame = useSetAtom(gameAtom);
  const emitEvent = useSetAtom(emitEventAtom);
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
      )!.balances[0] = usdBalance.sub(DONATION_PRICE);

      game.players.find(
        (player) => player.deviceId === currentPlayer.deviceId,
      )!.balances[currencyIndex] = causeTokenBalance.add(DONATION_REWARD);

      game.currencies[currencyIndex].totalSupply =
        game.currencies[currencyIndex].totalSupply.add(DONATION_REWARD);
    }).then(() => {
      emitEvent({
        type: "DONATION_MADE",
        cause: selectedCause.symbol as CauseSymbol,
        tokensAcquired: bn(20),
        playerId: currentPlayer.deviceId,
        payment: bn(20),
      });
    });
  }, [
    currentPlayer.deviceId,
    emitEvent,
    selectedCause,
    setActiveTab,
    updateGame,
  ]);

  return (
    <TabsContent value="causes">
      {!selectedCause && (
        <>
          <div className="flex flex-col gap-2">
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
                  <TokenBadge
                    className="size-16"
                    token={cause.symbol as CauseSymbol}
                  />
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

          <p className="font-bold text-md text-muted-foreground text-center">
            Donating to
          </p>

          <div className="flex flex-col items-center border-2 mt-4 p-6 shadow-sm rounded-lg">
            <TokenBadge
              className="size-32"
              token={selectedCause.symbol as CauseSymbol}
            />
            <div className="flex flex-col gap-0">
              <p className="font-bold text-xl">{selectedCause.name}</p>
            </div>
          </div>

          <div className="flex-grow" />

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
