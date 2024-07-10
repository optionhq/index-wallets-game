import { BalancesDonut } from "@/components/BalancesDonut";
import { CharacterBadge } from "@/components/CharacterBadge";
import {
  activeTabAtom,
  currentPlayerAtom,
  playerPortfolioValueAtom,
  transactionsHistoryAtom,
} from "@/components/Game.state";
import { Balances } from "@/components/tabs/Wallet/Balances";
import { History } from "@/components/tabs/Wallet/History";
import { Button } from "@/components/ui/button";

import { TabsContent } from "@/components/ui/tabs";
import { formatValue } from "@/lib/game/formatValue";
import { useAtomValue, useSetAtom } from "jotai";

export const WalletTab = () => {
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const portfolioValue = useAtomValue(playerPortfolioValueAtom);
  const totalBalance = formatValue(portfolioValue, { withIndexSign: true });
  const setActiveTab = useSetAtom(activeTabAtom);
  const transactionHistory = useAtomValue(transactionsHistoryAtom);

  return (
    <TabsContent value="wallet" className="gap-10">
      <div className="flex items-center gap-2">
        <BalancesDonut balances={currentPlayer.balances}>
          <CharacterBadge
            character={currentPlayer.character}
            className="size-16"
          />
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
        <Balances />
      </div>
      {transactionHistory && transactionHistory.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-muted-foreground leading-none">
            History
          </h2>
          <History />
        </>
      )}
    </TabsContent>
  );
};
