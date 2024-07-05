import { currenciesAtom } from "@/components/Game.state";
import { TokenBadge } from "@/components/TokenBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bn } from "@/lib/bnMath";
import { cn } from "@/lib/cn";
import { formatValue } from "@/lib/game/formatValue";
import { CauseSymbol } from "@/types/Cause";
import { CurrencySymbol } from "@/types/Currency";
import { useAtomValue } from "jotai";
import { BigNumber } from "mathjs";
import { HTMLAttributes, useMemo } from "react";

export interface ValueComparisonProps extends HTMLAttributes<HTMLTableElement> {
  vendorName: string;
  buyerValuations: BigNumber[];
  vendorValuations: BigNumber[];
  compositePayment: BigNumber[];
}

export const ValueComparison = ({
  vendorName,
  buyerValuations,
  vendorValuations,
  compositePayment,
  className,
  ...props
}: ValueComparisonProps) => {
  const currencies = useAtomValue(currenciesAtom);
  const data = useMemo(() => {
    return currencies.reduce(
      (data, currency, index) => {
        if (compositePayment[index].isZero()) return data;

        const vendorValue = vendorValuations[index].mul(
          compositePayment[index],
        );
        const buyerValue = buyerValuations[index].mul(compositePayment[index]);
        return {
          currencies: [...data.currencies, currency.symbol],
          buyerValues: [...data.buyerValues, buyerValue],
          payment: [...data.payment, compositePayment[index]],
          vendorValues: [...data.vendorValues, vendorValue],
          totalBuyerValue: data.totalBuyerValue.add(buyerValue),
          totalVendorValue: data.totalVendorValue.add(vendorValue),
        };
      },
      {
        currencies: [],
        buyerValues: [],
        payment: [],
        vendorValues: [],
        totalBuyerValue: bn(0),
        totalVendorValue: bn(0),
      } as {
        currencies: CurrencySymbol[];
        payment: BigNumber[];
        buyerValues: BigNumber[];
        vendorValues: BigNumber[];
        totalBuyerValue: BigNumber;
        totalVendorValue: BigNumber;
      },
    );
  }, [currencies, buyerValuations, vendorValuations, compositePayment]);

  return (
    <Table {...props} className={cn(" gap-4 text-xs text-center", className)}>
      <TableHeader>
        <TableRow>
          <TableHead className="align-middle h-8 row-span-2">Token</TableHead>
          <TableHead className="align-middle h-8 row-span-2">Amount</TableHead>
          <TableHead className="text-right align-middle h-8">
            Value to you
          </TableHead>
          <TableHead className="text-right align-middle h-8">
            Value to them
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.currencies.map((currency, i) => (
          <TableRow key={currency}>
            <TableCell className="flex items-center gap-1.5 font-medium">
              <TokenBadge
                withoutIcon
                token={currency}
                className={`size-1.5 rounded-none rotate-45`}
              />
              {currency}
            </TableCell>
            <TableCell>{formatValue(data.payment[i])}</TableCell>
            <TableCell
              className={cn(
                "text-right",
                data.buyerValues[i].isNegative() && "text-destructive",
                data.buyerValues[i].isZero() && "text-muted-foreground/70",
              )}
            >
              {formatValue(data.buyerValues[i], { withIndexSign: true })}
            </TableCell>
            <TableCell
              className={cn(
                "text-right",
                data.vendorValues[i].isNegative() && "text-destructive",
                data.vendorValues[i].isZero() && "text-muted-foreground/70",
              )}
            >
              {formatValue(data.vendorValues[i], { withIndexSign: true })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2} className="font-bold text-right">
            Total
          </TableCell>
          <TableCell className={cn("text-right")}>
            {formatValue(data.totalBuyerValue, { withIndexSign: true })}
          </TableCell>
          <TableCell className={cn("text-right")}>
            {formatValue(data.totalVendorValue, { withIndexSign: true })}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};
