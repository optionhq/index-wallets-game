import {
  PlayerOrDealer,
  currentPlayerAtom,
  dealerAtom,
  gameAtom,
  otherPlayersAtom,
  playerPortfolioValueAtom,
  purchaseRelativePriceIndexesAtom,
} from "@/components/Game.state";
import { PlayerToken } from "@/components/PlayerToken";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { bn } from "@/lib/bnMath";
import { cn } from "@/lib/cn";
import { formatValue } from "@/lib/game/formatValue";
import { compositePrice } from "@/lib/indexWallets/compositePrice";
import { useAtomValue, useSetAtom } from "jotai";
import { ReceiptIcon, Undo2Icon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export const PayTab = () => {
  const otherPlayers = useAtomValue(otherPlayersAtom);
  const purchaseRelativePriceIndexes = useAtomValue(
    purchaseRelativePriceIndexesAtom,
  );

  const [selectedPlayer, setSelectedPlayer] = useState<
    PlayerOrDealer | undefined
  >(undefined);

  const currentPlayer = useAtomValue(currentPlayerAtom);
  const dealer = useAtomValue(dealerAtom);

  const portfolioValue = useAtomValue(playerPortfolioValueAtom);

  const [vendorPriceInput, setVendorPriceInput] = useState<string>("");
  const vendorPrice = useMemo(() => {
    try {
      return bn(vendorPriceInput);
    } catch {
      return undefined;
    }
  }, [vendorPriceInput]);

  const buyerPrice = useMemo(() => {
    if (!selectedPlayer || !vendorPrice) return undefined;

    return vendorPrice.mul(
      purchaseRelativePriceIndexes[selectedPlayer.deviceId],
    );
  }, [selectedPlayer, vendorPrice, purchaseRelativePriceIndexes]);

  const hasEnoughFunds = useMemo(() => {
    if (!buyerPrice) return undefined;
    return buyerPrice.lte(portfolioValue);
  }, [buyerPrice, portfolioValue]);

  const balanceAfterPurchase = useMemo(() => {
    if (!buyerPrice) return undefined;
    return portfolioValue.sub(buyerPrice);
  }, [buyerPrice, portfolioValue]);

  const updateGame = useSetAtom(gameAtom);

  const makePayment = useCallback(async () => {
    if (!selectedPlayer || !vendorPrice || !buyerPrice || !hasEnoughFunds)
      return;

    const price = compositePrice({
      vendorPrice,
      buyerBalances: currentPlayer.balances,
      vendorValuations: selectedPlayer.valuations,
    });

    updateGame((game) => {
      game.players.find(
        (player) => player.deviceId === currentPlayer.deviceId,
      )!.balances = currentPlayer.balances.map((balance, i) =>
        balance.sub(price[i]),
      );
      game.players.find(
        (player) => player.deviceId === selectedPlayer.deviceId,
      )!.balances = selectedPlayer.balances.map((balance, i) =>
        balance.add(price[i]),
      );
    }).then(() => {
      toast.success(
        `Paid ${formatValue(buyerPrice, { withDollarSign: true })} to ${selectedPlayer.name}`,
      );
    });

    setSelectedPlayer(undefined);
  }, [
    vendorPrice,
    selectedPlayer,
    buyerPrice,
    hasEnoughFunds,
    currentPlayer,
    updateGame,
  ]);

  return (
    <TabsContent value="pay" className="p-2 h-full">
      {!selectedPlayer && (
        <>
          <h2 className="text-lg font-bold text-muted-foreground leading-none">
            Pay
          </h2>
          <div className="flex flex-col gap-2 mt-4">
            {(currentPlayer.isDealer
              ? otherPlayers
              : [dealer, ...otherPlayers]
            ).map((player) => (
              <div
                onClick={() => setSelectedPlayer(player)}
                key={player.deviceId}
                className="flex items-center border-2 cursor-pointer p-2 gap-2 shadow-sm rounded-lg hover:border-primary"
              >
                <PlayerToken className="size-16" />
                <div className="flex flex-col gap-0">
                  <p className="font-bold text-lg">{player.name}</p>
                  <p className="font-bold text-sm text-muted-foreground">
                    <ReceiptIcon className="inline size-4 align-text-top" /> x
                    {purchaseRelativePriceIndexes[player.deviceId].toFixed(1)}{" "}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {selectedPlayer && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2"
            onClick={() => setSelectedPlayer(undefined)}
          >
            <Undo2Icon />
          </Button>

          <p className="font-bold text-xl text-muted-foreground absolute top-4 left-0 right-0 mx-auto w-fit">
            Paying
          </p>

          <div className="flex flex-col items-center border-2 mt-4 p-6 shadow-sm rounded-lg">
            <PlayerToken className="size-32" />
            <div className="flex flex-col gap-0">
              <p className="font-bold text-xl">{selectedPlayer.name}</p>
              <p className="font-bold text-sm text-muted-foreground">
                <ReceiptIcon className="inline size-4 align-text-top" /> x
                {purchaseRelativePriceIndexes[selectedPlayer.deviceId].toFixed(
                  1,
                )}{" "}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mt-6">
            <Label
              htmlFor="vendor-price"
              className="text-center text-muted-foreground"
            >
              Their price
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
                    {formatValue(portfolioValue, {
                      withDollarSign: true,
                    })}
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
          </div>
          <div className="mt-14 flex flex-col items-center">
            {hasEnoughFunds === false && (
              <p className="text-destructive">Not enough funds</p>
            )}
            {hasEnoughFunds && (
              <Button
                onClick={makePayment}
                className="font-bold w-full text-lg h-14"
              >
                Pay
              </Button>
            )}
          </div>
        </>
      )}
    </TabsContent>
  );
};
