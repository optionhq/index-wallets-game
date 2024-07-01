import { BigNumber } from "mathjs";
import { ReactNode } from "react";
import IndexCurrency from "@/assets/img/index-wallet-currency-symbol.svg?react";

export interface FormatValueOptions {
  withIndexSign?: boolean;
}

export const formatValue: (
  value: BigNumber,
  options?: FormatValueOptions,
) => ReactNode = (value, options) => {
  if (value.greaterThan(9999999)) return "∞";
  return options?.withIndexSign ? (
    <span>
      {value.isNegative() ? "-" : ""}
      <IndexCurrency className="inline align-baseline" />
      {value.abs().toFixed(2)}
    </span>
  ) : (
    value.toFixed(2)
  );
};
