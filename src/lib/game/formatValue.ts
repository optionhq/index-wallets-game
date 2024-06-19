import { BigNumber } from "mathjs";

export interface FormatValueOptions {
  withDollarSign?: boolean;
}

export const formatValue: (
  value: BigNumber,
  options?: FormatValueOptions
) => string = (value, options) => {
  return options?.withDollarSign
    ? `${value.isNegative() ? "-$" : "$"}${value.abs().toFixed(2)}`
    : value.toFixed(2);
};
