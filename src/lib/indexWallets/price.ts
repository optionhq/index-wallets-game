import { bnMath } from "@/lib/bnMath";
import { tokenWeights } from "@/lib/indexWallets/tokenWeights";
import { BigNumber } from "mathjs";

export interface PriceParams {
  vendorPrice: BigNumber;
  vendorValuations: BigNumber[];
  viewerValuations: BigNumber[];
  buyerBalances: BigNumber[];
}

export const price = ({
  vendorPrice,
  vendorValuations,
  viewerValuations,
  buyerBalances,
}: PriceParams) =>
  bnMath.sum(
    bnMath.multiply(
      bnMath.multiply(
        vendorPrice,
        tokenWeights(buyerBalances, vendorValuations)
      ),
      viewerValuations
    ) as BigNumber[]
  );
