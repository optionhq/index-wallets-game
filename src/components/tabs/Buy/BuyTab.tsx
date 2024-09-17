import { BackButton } from "@/components/BackButton";
import { CharacterIcon } from "@/components/CharacterIcon";
import {
  currentAgentAtom,
  dealerAtom,
  emitEventAtom,
  gameAtom,
  gameIdAtom,
  networkValuationsAtom,
  otherPlayersAtom,
  payeePaymentValueInputAtom,
  playerPortfolioValueAtom,
  selectedPayeeAtom,
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
import { price } from "@/lib/indexWallets/price";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { BarChart3Icon, MinusIcon, PlusIcon } from "lucide-react";
import { BigNumber } from "mathjs";
import { useCallback, useMemo, useState } from "react";
import { sort, zip } from "remeda";

export const BuyTab = () => {
  const [selectedPayee, setSelectedPayee] = useAtom(selectedPayeeAtom);

  const otherPlayers = useAtomValue(otherPlayersAtom);
  const networkValuations = useAtomValue(networkValuationsAtom);
  const currentPlayer = useAtomValue(currentAgentAtom);
  const prices = useMemo(() => {
    return otherPlayers.reduce(
      (playerPrices, player) => ({
        ...playerPrices,
        [player.deviceId]: price({
          vendorPrice: player.retailPrice,
          buyerBalances: currentPlayer.balances,
          vendorValuations: player.valuations,
          viewerValuations: networkValuations,
        }),
      }),
      {} as Record<string, BigNumber>,
    );
  }, [currentPlayer, networkValuations, otherPlayers]);

  const sortedOtherPlayers = useMemo(
    () =>
      sort(otherPlayers, (playerA, playerB) =>
        prices[playerA.deviceId].sub(prices[playerB.deviceId]).toNumber(),
      ),

    [otherPlayers, prices],
  );
  const dealer = useAtomValue(dealerAtom);

  const payee = [dealer, ...otherPlayers].find(
    (player) => player.deviceId === selectedPayee,
  );
  const gameId = useAtomValue(gameIdAtom);

  const portfolioValue = useAtomValue(playerPortfolioValueAtom);

  const [payeePaymentValueInput, setPayeePaymentValueInput] = useAtom(
    payeePaymentValueInputAtom(gameId, selectedPayee),
  );

  const [amountOfGoods, setAmountOfGoods] = useState(1);

  const isDealerPayment = payee?.isDealer || currentPlayer.isDealer;
  const isPurchaseOfGoods = !isDealerPayment;

  const payeeValue = useMemo(() => {
    if (isDealerPayment) {
      try {
        return bn(payeePaymentValueInput);
      } catch {
        return undefined;
      }
    }

    if (!payee) return undefined;

    return payee.retailPrice.mul(amountOfGoods);
  }, [payee, payeePaymentValueInput, isDealerPayment, amountOfGoods]);

  const payerValue = useMemo(() => {
    if (!selectedPayee) return undefined;

    if (isPurchaseOfGoods) return prices[selectedPayee].mul(amountOfGoods);

    if (!payeeValue) return undefined;

    if (isDealerPayment) {
      return price({
        vendorPrice: payeeValue,
        buyerBalances: currentPlayer.balances,
        vendorValuations: dealer.valuations,
        viewerValuations: networkValuations,
      });
    }
  }, [
    prices,
    selectedPayee,
    payeeValue,
    isDealerPayment,
    amountOfGoods,
    currentPlayer,
    dealer,
    networkValuations,
    isPurchaseOfGoods,
  ]);

  // const hasEnoughFunds = useMemo(() => {
  //   if (!payerValue) return undefined;
  //   return payerValue.lte(portfolioValue);
  // }, [payerValue, portfolioValue]);

  const balanceAfterPurchase = useMemo(() => {
    if (!payerValue) return undefined;
    return portfolioValue.sub(payerValue);
  }, [payerValue, portfolioValue]);

  const updateGame = useSetAtom(gameAtom);
  const emitEvent = useSetAtom(emitEventAtom);

  const payeePrice = useMemo(() => {
    if (!payee || !payeeValue) return undefined;
    return compositePrice({
      vendorPrice: payeeValue,
      buyerBalances: currentPlayer.balances,
      vendorValuations: payee.valuations,
    });
  }, [currentPlayer, payee, payeeValue]);

  const hasEnoughFunds = useMemo(() => {
    if (!payeePrice) return undefined;
    return !zip(currentPlayer.balances, payeePrice).some(([balance, price]) =>
      balance.lt(price),
    );
  }, [payeePrice, currentPlayer.balances]);

  const makePayment = useCallback(async () => {
    if (
      !selectedPayee ||
      !payeeValue ||
      !payerValue ||
      !payeePrice ||
      !hasEnoughFunds
    )
      return;

    updateGame((game) => {
      game.players[currentPlayer.deviceId]!.balances =
        currentPlayer.balances.map((balance, i) => balance.sub(payeePrice[i]));
      game.players[selectedPayee].balances = payee!.balances.map((balance, i) =>
        balance.add(payeePrice[i]),
      );
    }).then(() => {
      emitEvent({
        type: "PAYMENT_MADE",
        from: currentPlayer.deviceId,
        fromName: currentPlayer.name,
        to: selectedPayee,
        toName: payee!.name,
        payment: payeePrice,
        vendorValuations: payee!.valuations,
        buyerNetworkValuations: networkValuations,
      });
    });

    setSelectedPayee(undefined);
  }, [
    selectedPayee,
    payeeValue,
    payerValue,
    hasEnoughFunds,
    updateGame,
    setSelectedPayee,
    currentPlayer,
    payeePrice,
    emitEvent,
    payee,
    networkValuations,
  ]);

  return (
    <TabsContent value="buy" className="justify-between xs:pt-10">
      {!selectedPayee && (
        <>
          <motion.div layout className="flex flex-col gap-2">
            {(currentPlayer.isDealer
              ? sortedOtherPlayers
              : [...sortedOtherPlayers, dealer]
            ).map((player) => {
              return (
                <motion.div
                  layoutId={player.deviceId}
                  onClick={() => setSelectedPayee(player.deviceId)}
                  key={player.deviceId}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border-2 p-2 shadow-sm hover:border-primary"
                >
                  <CharacterIcon
                    className="size-16"
                    character={player.character}
                  />
                  <div className="flex flex-col gap-0">
                    <p className="text-lg font-bold">{player.name}</p>

                    {prices[player.deviceId] && (
                      <p>
                        {formatValue(prices[player.deviceId], {
                          withIndexSign: true,
                        })}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
      {selectedPayee && payee && (
        <>
          <BackButton onClick={() => setSelectedPayee(undefined)} />

          <motion.div
            layout
            className="flex flex-col items-center gap-1 self-center"
          >
            <p className="text-lg font-bold">{payee.name}</p>
            <CharacterIcon
              character={payee.character}
              className="size-24 xs:size-28"
            />
          </motion.div>

          <motion.div
            layout
            className="flex flex-col items-center justify-center"
          >
            {isDealerPayment && (
              <>
                <Label
                  htmlFor="payee-value"
                  className="text-center text-muted-foreground"
                >
                  Send
                </Label>
                <div className="relative inline-block">
                  <span className="absolute left-4 top-3 h-4 align-middle text-2xl">
                    ⱡ
                  </span>
                  <Input
                    maxLength={6}
                    max={100}
                    value={payeePaymentValueInput}
                    onChange={(event) =>
                      setPayeePaymentValueInput(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") makePayment();
                    }}
                    step={0.01}
                    pattern="^\d+(\.\d{1,2})?$"
                    id="payee-value"
                    inputMode="decimal"
                    className="mt-1 h-12 w-32 place-self-center text-center text-lg"
                  />
                </div>
              </>
            )}
            {isPurchaseOfGoods && (
              <>
                <Label
                  htmlFor="amount-of-products"
                  className="text-center text-muted-foreground"
                >
                  Amount of products
                </Label>
                <div className="relative mt-1 flex items-center gap-1">
                  <Button
                    size="icon"
                    className="size-12 rounded-sm"
                    variant={"secondary"}
                    disabled={amountOfGoods <= 1}
                    onClick={() =>
                      setAmountOfGoods((amountOfGoods) =>
                        Math.max(amountOfGoods - 1, 1),
                      )
                    }
                  >
                    <MinusIcon />
                  </Button>
                  <Input
                    maxLength={6}
                    max={100}
                    value={amountOfGoods}
                    onChange={(event) =>
                      setAmountOfGoods(
                        Math.max(Math.floor(Number(event.target.value)), 1),
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") makePayment();
                    }}
                    pattern="^\d+$"
                    step={1}
                    id="amount-of-products"
                    type="number"
                    min={1}
                    className="h-12 w-32 place-self-center text-center text-lg"
                  />
                  <Button
                    size={"icon"}
                    className="size-12 rounded-sm"
                    variant={"secondary"}
                    onClick={() =>
                      setAmountOfGoods((amountOfGoods) => amountOfGoods + 1)
                    }
                  >
                    <PlusIcon />
                  </Button>
                </div>
              </>
            )}
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
                <div className="flex flex-col items-center text-muted-foreground/60">
                  <Label className="">You have</Label>
                  <p className="mt-2 text-lg font-bold">
                    {formatValue(portfolioValue, {
                      withIndexSign: true,
                    })}
                  </p>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex flex-col items-center">
                      <Label className="text-md mt-2 flex flex-col items-center text-muted-foreground">
                        <p className="font-bold">You pay</p>
                      </Label>
                      <div className="flex items-center gap-1">
                        <p className="text-xl font-bold text-muted-foreground">
                          {!payerValue
                            ? "---"
                            : formatValue(payerValue, { withIndexSign: true })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="h-fit w-fit rounded-sm border-primary px-3 py-1 text-xs font-bold tracking-wider text-primary"
                      >
                        <BarChart3Icon className="mr-1 size-2.5 align-text-top" />
                        SHOW BREAKDOWN
                      </Button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    className="max-h-64 w-72 overflow-auto p-1"
                  >
                    <ValueComparison
                      className="w-full overflow-clip rounded-sm"
                      compositePayment={payeePrice!}
                      buyerValuations={networkValuations}
                      vendorValuations={payee.valuations}
                    />
                  </PopoverContent>
                </Popover>

                <div className="flex flex-col items-center text-muted-foreground/60">
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
                className="overlap w-full text-center align-middle leading-[3.5rem] text-destructive"
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
                  className="overlap relative h-14 w-full text-lg font-bold"
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
