import { bnMath } from "@/lib/bnMath";
import { tokenWeights } from "@/lib/indexWallets/tokenWeights";
import { BigNumber } from "mathjs";

export interface CompositePriceParams {
  vendorPrice: BigNumber;
  buyerBalances: BigNumber[];
  vendorValuations: BigNumber[];
}

export const compositePrice = ({
  vendorPrice,
  buyerBalances,
  vendorValuations,
}: CompositePriceParams) =>
  bnMath.multiply(
    vendorPrice,
    tokenWeights(buyerBalances, vendorValuations),
  ) as BigNumber[];
