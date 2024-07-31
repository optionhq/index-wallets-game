import { BigNumber } from "mathjs";
import { ReactNode } from "react";

export interface FormatBalanceOptions {
  decimalPlaces?: number;
}

export const formatPercentage: (
  percentage: BigNumber,
  options?: FormatBalanceOptions,
) => ReactNode = (percentage, options) =>
  percentage.isFinite()
    ? percentage.toFixed(options?.decimalPlaces ?? 1) + "%"
    : percentage.isNegative()
      ? "-∞%"
      : "∞%";
