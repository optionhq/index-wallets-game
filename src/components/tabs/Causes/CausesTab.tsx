import { BackButton } from "@/components/BackButton";
import { BalancesDonut } from "@/components/BalancesDonut";
import {
  activeTabAtom,
  causesAtom,
  currenciesAtom,
  currentAgentAtom,
  emitEventAtom,
  gameAtom,
  networkValuationsAtom,
  playerPortfolioValueAtom,
  selectedCauseAtom,
} from "@/components/Game.state";
import { TokenBadge } from "@/components/TokenBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TabsContent } from "@/components/ui/tabs";
import { ValueComparison } from "@/components/ValueComparison";
import { CAUSE_VALUATIONS, DONATION_PRICE, DONATION_REWARD } from "@/config";
import { bn, bnMath, bnZeroPad } from "@/lib/bnMath";
import { cn } from "@/lib/cn";
import { formatBalance } from "@/lib/game/formatBalance";
import { formatValue } from "@/lib/game/formatValue";
import { compositePrice } from "@/lib/indexWallets/compositePrice";
import { valueOf } from "@/lib/indexWallets/valueOf";
import { CauseSymbol } from "@/types/Cause";
import { Popover } from "@radix-ui/react-popover";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { BarChart3Icon, HeartHandshakeIcon } from "lucide-react";
import { BigNumber } from "mathjs";
import { useCallback, useMemo } from "react";

export const CausesTab = () => {
  const [selectedCause, setSelectedCause] = useAtom(selectedCauseAtom);
  const causes = useAtomValue(causesAtom);
  const currentPlayer = useAtomValue(currentAgentAtom);
  const setActiveTab = useSetAtom(activeTabAtom);
  const updateGame = useSetAtom(gameAtom);
  const emitEvent = useSetAtom(emitEventAtom);
  const currencies = useAtomValue(currenciesAtom);
  const networkValuations = useAtomValue(networkValuationsAtom);

  const compositeDonationPrice = useMemo(
    () =>
      compositePrice({
        buyerBalances: currentPlayer.balances,
        vendorPrice: bn(DONATION_PRICE),
        vendorValuations: CAUSE_VALUATIONS,
      }),
    [currentPlayer],
  );

  const donationPrice = useMemo(
    () => valueOf(compositeDonationPrice, networkValuations),

    [networkValuations, compositeDonationPrice],
  );

  const makeDonation = useCallback(() => {
    if (!selectedCause) return;

    setSelectedCause(undefined);
    setActiveTab("wallet");
    const currencyIndex = currencies.findIndex(
      (currency) => currency.symbol === selectedCause.symbol,
    )!;

    const tokensAcquired = bn(DONATION_REWARD).sub(
      compositeDonationPrice[currencyIndex],
    );

    updateGame((game) => {
      const startingBalances = game.players.find(
        (player) => player.deviceId === currentPlayer.deviceId,
      )!.balances;

      game.players.find(
        (player) => player.deviceId === currentPlayer.deviceId,
      )!.balances = bnMath.subtract(
        startingBalances,
        compositeDonationPrice,
      ) as BigNumber[];

      game.players.find(
        (player) => player.deviceId === currentPlayer.deviceId,
      )!.balances[currencyIndex] =
        startingBalances[currencyIndex].add(tokensAcquired);

      game.currencies[currencyIndex].totalSupply =
        game.currencies[currencyIndex].totalSupply.add(DONATION_REWARD);
    }).then(() => {
      emitEvent({
        type: "DONATION_MADE",
        cause: selectedCause.symbol as CauseSymbol,
        tokensAcquired,
        playerId: currentPlayer.deviceId,
        playerName: currentPlayer.name,
        payment: compositeDonationPrice,
        causeValuations: bnZeroPad([bn(1)], networkValuations.length),
        donorValuations: networkValuations,
      });
    });
  }, [
    selectedCause,
    setSelectedCause,
    setActiveTab,
    currencies,
    compositeDonationPrice,
    updateGame,
    currentPlayer.deviceId,
    currentPlayer.name,
    emitEvent,
    networkValuations,
  ]);

  const portfolioValue = useAtomValue(playerPortfolioValueAtom);

  const hasEnoughFunds = useMemo(() => {
    if (!donationPrice) return undefined;
    return donationPrice.lte(portfolioValue);
  }, [donationPrice, portfolioValue]);

  const balanceAfterPurchase = useMemo(() => {
    if (!donationPrice) return undefined;
    return portfolioValue.sub(donationPrice);
  }, [donationPrice, portfolioValue]);

  return (
    <TabsContent value="causes" className="justify-between xs:pt-10">
      {!selectedCause && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-center p-2 text-sm text-muted-foreground/80 -mt-2">
              Donate{" "}
              <strong>
                {formatValue(donationPrice, {
                  withIndexSign: true,
                  decimalPlaces: 1,
                })}
              </strong>{" "}
              (<strong>${DONATION_PRICE}</strong>) to a cause and earn cashback
              in their token
            </p>
            {causes.map((cause, index) => {
              const currencyIndex = index + 1;
              const isPlayerCause = currentPlayer.cause === cause.symbol;
              const tokensAcquired = bn(DONATION_REWARD).sub(
                compositeDonationPrice[currencyIndex],
              );
              return (
                <div
                  onClick={() => setSelectedCause(cause)}
                  key={cause.symbol}
                  className={cn(
                    "relative flex items-center border-2 cursor-pointer py-4 px-6 gap-4 shadow-sm rounded-lg hover:border-primary",
                  )}
                >
                  <TokenBadge
                    className="size-16"
                    token={cause.symbol as CauseSymbol}
                  />
                  <div className="flex flex-col gap-2">
                    <p className="font-bold text-lg">{cause.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <strong>
                        {formatBalance(tokensAcquired)} {cause.symbol}
                      </strong>{" "}
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
          <BackButton onClick={() => setSelectedCause(undefined)} />

          <motion.div
            layout
            className="flex flex-col items-center gap-1 self-center"
          >
            <p className="font-bold text-lg">{selectedCause.name}</p>

            <TokenBadge
              token={selectedCause.symbol}
              className="size-24 xs:size-28"
            />
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
            <p className="relative inline-block place-self-center w-32 h-12 mt-1 text-center  text-lg">
              ⱡ{DONATION_PRICE}
            </p>
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
                          x{donationPrice.div(bn(DONATION_PRICE)).toFixed(1)}
                        </p>
                      </Label>
                      <div className="flex gap-1 items-center">
                        <p className="text-xl font-bold text-muted-foreground">
                          {formatValue(donationPrice, { withIndexSign: true })}
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
                        className="rounded-sm w-fit h-fit px-3 py-1 font-bold text-primary border-primary tracking-wider text-xs"
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
                      className="w-full rounded-sm overflow-clip"
                      compositePayment={compositeDonationPrice}
                      buyerValuations={networkValuations}
                      vendorValuations={CAUSE_VALUATIONS}
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
                  onClick={makeDonation}
                  className="relative overlap font-bold w-full text-lg h-14"
                >
                  <motion.div
                    className="relative"
                    initial={{ translateY: 200 }}
                    animate={{ translateY: 0 }}
                    exit={{ translateY: 200, zIndex: -10 }}
                  >
                    Donate
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
