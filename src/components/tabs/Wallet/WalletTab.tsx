import {
  activeTabAtom,
  currenciesAtom,
  currentPlayerAtom,
  playerPortfolioValueAtom,
} from "@/components/Game.state";
import { PlayerToken } from "@/components/PlayerToken";
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
import { useAtomValue, useSetAtom } from "jotai";
import {} from "lucide-react";

export const WalletTab = () => {
  const currencies = useAtomValue(currenciesAtom);
  const currentPlayer = useAtomValue(currentPlayerAtom);
  const portfolioValue = useAtomValue(playerPortfolioValueAtom);
  const totalBalance = formatValue(portfolioValue);
  const setActiveTab = useSetAtom(activeTabAtom);
  return (
    <TabsContent value="wallet" className="gap-10">
      <div className="flex items-center gap-2">
        <PlayerToken className="size-16" />
        <div className="flex flex-col gap-0">
          <p className="font-bold text-lg text-muted-foreground">
            {currentPlayer.name}
          </p>
          <p className="font-bold text-lg">${totalBalance}</p>
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
                <TableCell className="font-medium">{currency.symbol}</TableCell>
                <TableCell className="font-mono">
                  {formatValue(currentPlayer.balances[i])}
                </TableCell>
                <TableCell className="text-right">
                  {currentPlayer.valuations[i].toFixed(1)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatValue(
                    currentPlayer.balances[i].mul(currentPlayer.valuations[i]),
                    { withDollarSign: true },
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
};
