import { BalancesDonut } from "@/components/BalancesDonut";
import {
  currentPlayerAtom,
  playersAndDealerAtom,
  transactionsHistoryAtom,
} from "@/components/Game.state";
import { TokenBadge } from "@/components/TokenBadge";
import { formatValue } from "@/lib/game/formatValue";
import { valueOf } from "@/lib/indexWallets/valueOf";
import { intersperse } from "@/lib/utils/intersperse";
import { cause } from "@/types/Cause";
import { DonationMadeEvent, PaymentMadeEvent } from "@/types/Events";
import { Player } from "@/types/Player";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { DownloadIcon, HandHeartIcon, UploadIcon } from "lucide-react";

export const History = () => {
  const characters = useAtomValue(playersAndDealerAtom);
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const transactionHistory = useAtomValue(transactionsHistoryAtom);
  return (
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
