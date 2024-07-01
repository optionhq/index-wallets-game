import { BalancesDonut } from "@/components/BalancesDonut";
import {
  activeTabAtom,
  currenciesAtom,
  currentPlayerAtom,
  playerPortfolioValueAtom,
  playersAndDealerAtom,
  transactionsHistoryAtom,
} from "@/components/Game.state";
import { PlayerToken } from "@/components/PlayerToken";
import { TokenBadge } from "@/components/TokenBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { formatValue } from "@/lib/game/formatValue";
import { valueOf } from "@/lib/indexWallets/valueOf";
import { intersperse } from "@/lib/utils/intersperse";
import { CauseSymbol, cause } from "@/types/Cause";
import { DonationMadeEvent, PaymentMadeEvent } from "@/types/Events";
import { Player } from "@/types/Player";
import { motion } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { DownloadIcon, HandHeartIcon, UploadIcon } from "lucide-react";

export const WalletTab = () => {
  const currencies = useAtomValue(currenciesAtom);
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const portfolioValue = useAtomValue(playerPortfolioValueAtom);
  const totalBalance = formatValue(portfolioValue, { withIndexSign: true });
  const setActiveTab = useSetAtom(activeTabAtom);
  const transactionHistory = useAtomValue(transactionsHistoryAtom);
  const characters = useAtomValue(playersAndDealerAtom);

  return (
    <TabsContent value="wallet" className="gap-10">
      <div className="flex items-center gap-2">
        <BalancesDonut balances={currentPlayer.balances}>
          <PlayerToken playerId={currentPlayer.deviceId} className="size-16" />
        </BalancesDonut>
        <div className="flex flex-col gap-0">
          <p className="font-bold text-lg text-muted-foreground">
            {currentPlayer.name}
          </p>
          <p className="font-bold text-lg">{totalBalance}</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between ">
          <h2 className="text-lg font-bold text-muted-foreground leading-none">
            Balances
          </h2>
          {!currentPlayer.isDealer && (
            <Button
              variant="link"
              className="p-0 h-fit mt-6 text-xs"
              onClick={() => setActiveTab("valuations")}
            >
              Change valuations
            </Button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="align-middle h-8">Token</TableHead>
              <TableHead className="align-middle h-8">Balance</TableHead>
              <TableHead className="text-right align-middle h-8">
                Valuation
              </TableHead>
              <TableHead className="text-right align-middle h-8">
                Value
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencies.map((currency, i) => (
              <TableRow key={currency.symbol}>
                <TableCell className="flex items-center gap-1.5 font-medium">
                  <TokenBadge
                    withoutIcon
                    token={currency.symbol as CauseSymbol}
                    className={`size-1.5 rounded-none rotate-45`}
                  />
                  {currency.symbol}
                </TableCell>
                <TableCell className="font-mono">
                  {formatValue(currentPlayer.balances[i])}
                </TableCell>
                <TableCell className="text-right">
                  {currentPlayer.valuations[i].toFixed(1)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatValue(
                    currentPlayer.balances[i].mul(currentPlayer.valuations[i]),
                    { withIndexSign: true },
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <h2 className="text-lg font-bold text-muted-foreground leading-none">
        History
      </h2>
      <motion.div layout className="grid grid-cols-[auto_1fr] gap-6">
        {intersperse(
          (transactionHistory ?? []).map((transaction) =>
            historyEntry(transaction, currentPlayer, characters),
          ),
          (index) => [
            <div
              className="col-span-2 h-px bg-muted"
              key={`separator-${index}`}
            />,
          ],
        ).flat()}
      </motion.div>
    </TabsContent>
  );
};

const historyEntry = (
  transaction: (PaymentMadeEvent | DonationMadeEvent) & { id: string },
  currentPlayer: Player,
  characters: Player[],
) => {
  switch (true) {
    case transaction.type === "PAYMENT_MADE" &&
      transaction.from === currentPlayer.deviceId:
      return [
        <UploadIcon
          className="p-2 size-10 rounded-full bg-muted"
          key={`${transaction.id}-icon`}
        />,
        <div className="flex flex-col" key={`${transaction.id}-description`}>
          <strong>Payment made</strong>
          <p>
            {
              characters.find(
                (character) => (character.deviceId = transaction.to),
              )?.name
            }
          </p>
          <div className="flex gap-1 items-center">
            <p>
              {formatValue(
                valueOf(transaction.payment, currentPlayer.valuations),
                { withIndexSign: true },
              )}
            </p>
            <BalancesDonut balances={transaction.payment} className="p-1">
              <div className="size-2 bg-background rounded-full" />{" "}
            </BalancesDonut>
          </div>
        </div>,
      ];
    case transaction.type === "PAYMENT_MADE" &&
      transaction.to === currentPlayer.deviceId:
      return [
        <DownloadIcon
          className="p-2 size-10 rounded-full bg-green-100"
          key={`${transaction.id}-icon`}
        />,
        <div className="flex flex-col" key={`${transaction.id}-description`}>
          <strong>Payment received</strong>
          <p>
            {
              characters.find(
                (character) => (character.deviceId = transaction.from),
              )?.name
            }
          </p>
          <div className="flex gap-1 items-center">
            <p>
              {formatValue(
                valueOf(transaction.payment, currentPlayer.valuations),
                { withIndexSign: true },
              )}
            </p>
            <BalancesDonut balances={transaction.payment} className="p-1">
              <div className="size-2 bg-background rounded-full" />{" "}
            </BalancesDonut>
          </div>
        </div>,
      ];
    case transaction.type === "DONATION_MADE":
      return [
        <HandHeartIcon
          className="p-2 size-10 rounded-full bg-muted"
          key={`${transaction.id}-icon`}
        />,
        <div className="flex flex-col" key={`${transaction.id}-description`}>
          <strong>Donation made</strong>
          <div className="flex gap-2 items-center">
            <p>{cause[transaction.cause].name}</p>
            <TokenBadge
              token={transaction.cause}
              withoutIcon
              className=" size-2 rounded-none rotate-45"
            />
          </div>
          <div className="flex gap-1 items-center">
            <p>
              {formatValue(transaction.payment, {
                withIndexSign: true,
              })}
            </p>
            <BalancesDonut balances={[transaction.payment]} className="p-1">
              <div className="size-2 bg-background rounded-full" />{" "}
            </BalancesDonut>
          </div>
        </div>,
      ];
    default:
      return [];
  }
};
