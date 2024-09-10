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
import { bn } from "@/lib/bnMath";
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
          <TableHead className="h-8 align-middle">Token</TableHead>
          <TableHead className="h-8 align-middle">Balance</TableHead>
          <TableHead className="h-8 text-right align-middle">
            Valuation
          </TableHead>
          <TableHead className="h-8 text-right align-middle">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currencies.map((currency, i) => (
          <TableRow key={currency.symbol}>
            <TableCell className="flex items-center gap-1.5 font-medium">
              <TokenBadge
                withoutIcon
                token={currency.symbol as CauseSymbol}
                className={`size-1.5 rotate-45 rounded-none`}
              />
              {currency.symbol}
            </TableCell>
            <TableCell>{formatValue(currentPlayer.balances[i])}</TableCell>
            <TableCell className="text-right">
              {(networkValuations[i] ?? bn(0)).toFixed(1)}
            </TableCell>
            <TableCell className="text-right">
              {formatValue(
                currentPlayer.balances[i].mul(networkValuations[i] ?? bn(0)),
                { withIndexSign: true },
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
