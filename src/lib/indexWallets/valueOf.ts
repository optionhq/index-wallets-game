import { bn } from "@/lib/bnMath";
import { padArray } from "@/lib/utils/padArray";
import { BigNumber, dotMultiply, sum } from "mathjs";

export const valueOf = (amounts: BigNumber[], valuations: BigNumber[]) =>
  sum(dotMultiply(padArray(amounts, valuations.length, bn(0)), valuations));
