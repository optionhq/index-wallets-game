import { BigNumber, dotMultiply, sum } from "mathjs";

export const valueOf = (amounts: BigNumber[], valuations: BigNumber[]) =>
  sum(dotMultiply(amounts, valuations));
