import { bn } from "@/lib/bnMath";
import { padArray } from "@/lib/utils/padArray";
import { BigNumber } from "mathjs";

export const normalizeVectors = (...vectors: BigNumber[][]): BigNumber[][] => {
  const maxLength = Math.max(...vectors.map((v) => v.length));
  return vectors.map((v) => padArray(v, maxLength, bn(0)));
};
