import { BigNumber } from "mathjs";
import { ReactNode } from "react";

export interface FormatBalanceOptions {
  decimalPlaces?: number;
}

export const formatBalance: (
  balance: BigNumber,
  options?: FormatBalanceOptions,
) => ReactNode = (value, options) =>
  value.isFinite()
    ? value.toFixed(options?.decimalPlaces ?? 1)
    : value.isNegative()
      ? "-∞"
      : "∞";
