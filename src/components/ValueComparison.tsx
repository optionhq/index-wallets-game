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
import { bn, bnZeroPad } from "@/lib/bnMath";
import { cn } from "@/lib/cn";
import { formatValue } from "@/lib/game/formatValue";
import { CurrencySymbol } from "@/types/Currency";
import { useAtomValue } from "jotai";
import { BigNumber } from "mathjs";
import { HTMLAttributes, useMemo } from "react";

export interface ValueComparisonProps extends HTMLAttributes<HTMLTableElement> {
  buyerValuations: BigNumber[];
  vendorValuations: BigNumber[];
  compositePayment: BigNumber[];
}

export const ValueComparison = ({
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

        const vendorValue = bnZeroPad(vendorValuations, currencies.length)[
          index
        ].mul(compositePayment[index]);
        const buyerValue = bnZeroPad(buyerValuations, currencies.length)[
          index
        ].mul(compositePayment[index]);
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
    <Table {...props} className={cn("gap-4 text-center text-xs", className)}>
      <TableHeader>
        <TableRow>
          <TableHead className="row-span-2 h-8 align-middle">Token</TableHead>
          <TableHead className="row-span-2 h-8 align-middle">Amount</TableHead>
          <TableHead className="h-8 text-right align-middle">
            Value to you
          </TableHead>
          <TableHead className="h-8 text-right align-middle">
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
                className={`size-1.5 rotate-45 rounded-none`}
              />
              {currency}
            </TableCell>
            <TableCell>{formatValue(data.payment[i])}</TableCell>
            <TableCell
              className={cn(
                "text-right",
                data.buyerValues[i].isZero() && "text-muted-foreground/70",
              )}
            >
              {formatValue(data.buyerValues[i], { withIndexSign: true })}
            </TableCell>
            <TableCell
              className={cn(
                "text-right",
                data.vendorValues[i].lessThan(data.buyerValues[i]) &&
                  "text-red-700/80",
                data.vendorValues[i].greaterThan(data.buyerValues[i]) &&
                  "text-green-700/80",
              )}
            >
              {formatValue(data.vendorValues[i], { withIndexSign: true })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2} className="text-right font-bold">
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
