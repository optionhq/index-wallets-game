import { bnMath } from "@/lib/bnMath";
import { BigNumber } from "mathjs";

export const tokenWeights = (
  buyerBalances: BigNumber[],
  vendorValuations: BigNumber[]
) =>
  bnMath.dotDivide(
    buyerBalances,
    bnMath.multiply(buyerBalances, vendorValuations)
  );
