import { bnMath, bnZeroPad } from "@/lib/bnMath";
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
}: CompositePriceParams) => {
  const amountCurrencies = Math.max(
    vendorValuations.length,
    buyerBalances.length,
  );
  return bnMath.multiply(
    vendorPrice,
    tokenWeights(
      bnZeroPad(buyerBalances, amountCurrencies),
      bnZeroPad(vendorValuations, amountCurrencies),
    ),
  ) as BigNumber[];
};
