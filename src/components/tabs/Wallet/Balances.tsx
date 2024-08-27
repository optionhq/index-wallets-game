import {
  currenciesAtom,
  currentAgentAtom,
  networkValuationsAtom,
} from "@/components/Game.state";
import { TokenBadge } from "@/components/TokenBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatValue } from "@/lib/game/formatValue";
import { CauseSymbol } from "@/types/Cause";
import { useAtomValue } from "jotai";

export const Balances = () => {
  const currentPlayer = useAtomValue(currentAgentAtom);
  const currencies = useAtomValue(currenciesAtom);
  const networkValuations = useAtomValue(networkValuationsAtom);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="align-middle h-8">Token</TableHead>
          <TableHead className="align-middle h-8">Balance</TableHead>
          <TableHead className="text-right align-middle h-8">
            Valuation
          </TableHead>
          <TableHead className="text-right align-middle h-8">Value</TableHead>
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
            <TableCell>{formatValue(currentPlayer.balances[i])}</TableCell>
            <TableCell className="text-right">
              {networkValuations[i].toFixed(1)}
            </TableCell>
            <TableCell className="text-right">
              {formatValue(
                currentPlayer.balances[i].mul(networkValuations[i]),
                { withIndexSign: true },
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
