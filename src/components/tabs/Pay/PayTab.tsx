import { BalancesDonut } from "@/components/BalancesDonut";
import { CharacterBadge } from "@/components/CharacterBadge";
import {
  currentAgentAtom,
  dealerAtom,
  emitEventAtom,
  gameAtom,
  gameIdAtom,
  otherPlayersAtom,
  playerPortfolioValueAtom,
  purchaseRelativePriceIndexesAtom,
  selectedPayeeAtom,
  vendorPriceAtom,
} from "@/components/Game.state";
import { ValueComparison } from "@/components/ValueComparison";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TabsContent } from "@/components/ui/tabs";
import { bn } from "@/lib/bnMath";
import { cn } from "@/lib/cn";
import { formatValue } from "@/lib/game/formatValue";
import { compositePrice } from "@/lib/indexWallets/compositePrice";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { BarChart3Icon, ReceiptIcon, Undo2Icon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { sort } from "remeda";

export const PayTab = () => {
  const purchaseRelativePriceIndexes = useAtomValue(
    purchaseRelativePriceIndexesAtom,
  );

  const [selectedPayee, setSelectedPayee] = useAtom(selectedPayeeAtom);

  const otherPlayers = useAtomValue(otherPlayersAtom);
  const sortedOtherPlayers = useMemo(
    () =>
      sort(otherPlayers, (playerA, playerB) =>
        purchaseRelativePriceIndexes[playerA.deviceId]
          .sub(purchaseRelativePriceIndexes[playerB.deviceId])
          .toNumber(),
      ),

    [otherPlayers, purchaseRelativePriceIndexes],
  );
  const currentPlayer = useAtomValue(currentAgentAtom);
  const dealer = useAtomValue(dealerAtom);

  const payee = [dealer, ...otherPlayers].find(
    (player) => player.deviceId === selectedPayee,
  );
  const gameId = useAtomValue(gameIdAtom);

  const portfolioValue = useAtomValue(playerPortfolioValueAtom);

  const [vendorPriceInput, setVendorPriceInput] = useAtom(
    vendorPriceAtom(gameId, selectedPayee),
  );
  const vendorPrice = useMemo(() => {
    try {
      return bn(vendorPriceInput);
    } catch {
      return undefined;
    }
  }, [vendorPriceInput]);

  const buyerPrice = useMemo(() => {
    if (!selectedPayee || !vendorPrice) return undefined;

    return vendorPrice.mul(purchaseRelativePriceIndexes[selectedPayee]);
  }, [selectedPayee, vendorPrice, purchaseRelativePriceIndexes]);

  const hasEnoughFunds = useMemo(() => {
    if (!buyerPrice) return undefined;
    return buyerPrice.lte(portfolioValue);
  }, [buyerPrice, portfolioValue]);

  const balanceAfterPurchase = useMemo(() => {
    if (!buyerPrice) return undefined;
    return portfolioValue.sub(buyerPrice);
  }, [buyerPrice, portfolioValue]);

  const updateGame = useSetAtom(gameAtom);
  const emitEvent = useSetAtom(emitEventAtom);

  const price = useMemo(() => {
    if (!payee || !vendorPrice) return undefined;
    return compositePrice({
      vendorPrice,
      buyerBalances: currentPlayer.balances,
      vendorValuations: payee.valuations,
    });
  }, [currentPlayer, payee, vendorPrice]);

  const makePayment = useCallback(async () => {
    if (
      !selectedPayee ||
      !vendorPrice ||
      !buyerPrice ||
      !price ||
      !hasEnoughFunds
    )
      return;

    updateGame((game) => {
      game.players.find(
        (player) => player.deviceId === currentPlayer.deviceId,
      )!.balances = currentPlayer.balances.map((balance, i) =>
        balance.sub(price[i]),
      );
      game.players.find(
        (player) => player.deviceId === selectedPayee,
      )!.balances = payee!.balances.map((balance, i) => balance.add(price[i]));
    }).then(() => {
      emitEvent({
        type: "PAYMENT_MADE",
        from: currentPlayer.deviceId,
        fromName: currentPlayer.name,
        to: selectedPayee,
        toName: payee!.name,
        payment: price,
        vendorValuations: payee!.valuations,
        buyerValuations: currentPlayer.valuations,
      });
    });

    setSelectedPayee(undefined);
  }, [
    selectedPayee,
    vendorPrice,
    buyerPrice,
    hasEnoughFunds,
    updateGame,
    setSelectedPayee,
    currentPlayer,
    price,
    emitEvent,
    payee,
  ]);

  return (
    <TabsContent value="pay" className="justify-between xs:pt-10">
      {!selectedPayee && (
        <>
          <motion.div layout className="flex flex-col gap-2">
            {(currentPlayer.isDealer
              ? sortedOtherPlayers
              : [dealer, ...sortedOtherPlayers]
            ).map((player) => (
              <motion.div
                layoutId={player.deviceId}
                onClick={() => setSelectedPayee(player.deviceId)}
                key={player.deviceId}
                className="flex items-center border-2 cursor-pointer p-2 gap-2 shadow-sm rounded-lg hover:border-primary"
              >
                <BalancesDonut balances={player.balances}>
                  <CharacterBadge
                    className="size-16"
                    character={player.character}
                  />
                </BalancesDonut>
                <div className="flex flex-col gap-0">
                  <p className="font-bold text-lg">{player.name}</p>
                  <p className="font-bold text-sm text-muted-foreground">
                    <ReceiptIcon className="inline size-4 align-text-top" /> x
                    {purchaseRelativePriceIndexes[player.deviceId].toFixed(1)}{" "}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
      {selectedPayee && payee && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-0.5"
            onClick={() => setSelectedPayee(undefined)}
          >
            <Undo2Icon />
          </Button>

          <motion.div
            layout
            className="flex flex-col items-center gap-1 self-center"
          >
            <p className="font-bold text-lg">{payee.name}</p>
            <BalancesDonut balances={payee.balances} className="p-1.5">
              <CharacterBadge
                character={payee.character}
                className="size-24 xs:size-28"
              />
            </BalancesDonut>
          </motion.div>

          <motion.div
            layout
            className="flex flex-col items-center justify-center"
          >
            <Label
              htmlFor="vendor-price"
              className="text-center text-muted-foreground"
            >
              Their price
            </Label>
            <div className="relative inline-block">
              <span className="absolute text-2xl align-middle left-4  top-3 h-4">
                ⱡ
              </span>
              <Input
                maxLength={6}
                max={100}
                value={vendorPriceInput}
                onChange={(event) => setVendorPriceInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") makePayment();
                }}
                step={0.01}
                pattern="^\d+(\.\d{1,2})?$"
                id="vendor-price"
                inputMode="decimal"
                className="place-self-center w-32 h-12 mt-1 text-center  text-lg"
              />
            </div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {balanceAfterPurchase && (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-3"
              >
                <div className="flex items-center flex-col text-muted-foreground/60">
                  <Label className="">You have</Label>
                  <p className="mt-2 text-lg font-bold ">
                    {formatValue(portfolioValue, {
                      withIndexSign: true,
                    })}
                  </p>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex items-center flex-col">
                      <Label className="flex flex-col items-center mt-2 text-md text-muted-foreground">
                        <p className="font-bold">You pay</p>
                        <p className=" text-xs text-muted-foreground/60">
                          x
                          {purchaseRelativePriceIndexes[selectedPayee].toFixed(
                            1,
                          )}
                        </p>
                      </Label>
                      <div className="flex gap-1 items-center">
                        <p className="text-xl font-bold text-muted-foreground">
                          {!buyerPrice
                            ? "---"
                            : formatValue(buyerPrice, { withIndexSign: true })}
                        </p>
                        <BalancesDonut
                          balances={currentPlayer.balances}
                          className="relative"
                        >
                          <div className="size-2 bg-background rounded-full" />
                        </BalancesDonut>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-sm w-fit h-fit px-3 py-1 font-bold text-muted-foreground tracking-wider text-xs"
                      >
                        <BarChart3Icon className="mr-1 size-2.5 align-text-top" />
                        BREAKDOWN
                      </Button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    className="max-h-64 w-72 overflow-auto p-1"
                  >
                    <ValueComparison
                      vendorName={payee.name}
                      className="w-full rounded-sm overflow-clip"
                      compositePayment={price!}
                      buyerValuations={currentPlayer.valuations}
                      vendorValuations={payee.valuations}
                    />
                  </PopoverContent>
                </Popover>

                <div className="flex items-center flex-col text-muted-foreground/60">
                  <Label className=" ">You'll have</Label>
                  <p
                    className={cn(
                      "mt-2 text-lg font-bold",
                      balanceAfterPurchase.isNegative() && "text-destructive",
                    )}
                  >
                    {formatValue(balanceAfterPurchase, {
                      withIndexSign: true,
                    })}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className="grid">
            {hasEnoughFunds === false && (
              <motion.p
                key="not-enough-funds"
                className="overlap text-destructive w-full leading-[3.5rem] align-middle text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Not enough funds
              </motion.p>
            )}

            <AnimatePresence mode="popLayout">
              {hasEnoughFunds && (
                <Button
                  key="pay-button"
                  asChild
                  onClick={makePayment}
                  className="relative overlap font-bold w-full text-lg h-14"
                >
                  <motion.div
                    className="relative"
                    initial={{ translateY: 200 }}
                    animate={{ translateY: 0 }}
                    exit={{ translateY: 200, zIndex: -10 }}
                  >
                    Pay
                  </motion.div>
                </Button>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </TabsContent>
  );
};
