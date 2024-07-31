import { BigNumber } from "mathjs";
import { ReactNode } from "react";

export interface FormatValueOptions {
  withIndexSign?: boolean;
  decimalPlaces?: number;
}

export const formatValue: (
  value: BigNumber,
  options?: FormatValueOptions,
) => ReactNode = (value, options) =>
  (value.isNegative() ? "-" : "") +
  (options?.withIndexSign ? "ⱡ" : "") +
  (value.isFinite() ? value.abs().toFixed(options?.decimalPlaces ?? 2) : "∞");
