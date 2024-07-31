import { bn, bnMath } from "@/lib/bnMath";
import { BigNumber } from "mathjs";

export const tokenWeights = (
  buyerBalances: BigNumber[],
  vendorValuations: BigNumber[],
) => {
  const mutualValue = bnMath.multiply(
    buyerBalances,
    vendorValuations,
  ) as unknown as BigNumber;

  if (mutualValue.isZero()) return buyerBalances.map(() => bn(Infinity));

  return bnMath.dotDivide(buyerBalances, mutualValue);
};
