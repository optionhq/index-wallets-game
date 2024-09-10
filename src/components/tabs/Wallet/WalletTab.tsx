import { CharacterIcon } from "@/components/CharacterIcon";
import {
  activeTabAtom,
  currentAgentAtom,
  playerPortfolioValueAtom,
} from "@/components/Game.state";
import { Balances } from "@/components/tabs/Wallet/Balances";
import { History, historyAtom } from "@/components/tabs/Wallet/History";
import { Button } from "@/components/ui/button";

import { TabsContent } from "@/components/ui/tabs";
import { formatValue } from "@/lib/game/formatValue";
import { useAtomValue, useSetAtom } from "jotai";

export const WalletTab = () => {
  const currentPlayer = useAtomValue(currentAgentAtom);
  const portfolioValue = useAtomValue(playerPortfolioValueAtom);
  const totalBalance = formatValue(portfolioValue, { withIndexSign: true });
  const setActiveTab = useSetAtom(activeTabAtom);
  const history = useAtomValue(historyAtom);

  return (
    <TabsContent value="wallet" className="gap-10">
      <div className="flex items-center gap-2">
        <CharacterIcon
          character={currentPlayer.character}
          className="size-16"
        />
        <div className="flex flex-col gap-0">
          <p className="text-lg font-bold text-muted-foreground">
            {currentPlayer.name}
          </p>
          <p className="text-lg font-bold">{totalBalance}</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between">
          <h2 className="text-lg font-bold leading-none text-muted-foreground">
            Balances
          </h2>
          {!currentPlayer.isDealer && (
            <Button
              variant="link"
              className="mt-6 h-fit p-0 text-xs"
              onClick={() => setActiveTab("storefront")}
            >
              Change valuations
            </Button>
          )}
        </div>
        <Balances />
      </div>
      {history && history.length > 0 && (
        <>
          <h2 className="text-lg font-bold leading-none text-muted-foreground">
            History
          </h2>
          <History />
        </>
      )}
    </TabsContent>
  );
};
