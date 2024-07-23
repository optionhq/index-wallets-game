import { bnMath, bnZeroPad } from "@/lib/bnMath";
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
}: PriceParams) => {
  const amountCurrencies = Math.max(
    vendorValuations.length,
    viewerValuations.length,
    buyerBalances.length,
  );
  return bnMath.sum(
    bnMath.multiply(
      bnMath.multiply(
        vendorPrice,
        tokenWeights(
          bnZeroPad(buyerBalances, amountCurrencies),
          bnZeroPad(vendorValuations, amountCurrencies),
        ),
      ),
      bnZeroPad(viewerValuations, amountCurrencies),
    ) as BigNumber[],
  );
};
