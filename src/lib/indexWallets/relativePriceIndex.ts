import { bn } from "@/lib/bnMath";
import { price } from "@/lib/indexWallets/price";
import { BigNumber } from "mathjs";

export interface RelativePriceIndexParams {
  vendorValuations: BigNumber[];
  viewerValuations: BigNumber[];
  buyerBalances: BigNumber[];
}

export const relativePriceIndex = ({
  vendorValuations,
  viewerValuations,
  buyerBalances,
}: RelativePriceIndexParams) => {
  const vendorPrice = bn(1);

  const viewerPriceIndex = price({
    vendorPrice,
    vendorValuations,
    viewerValuations,
    buyerBalances,
  });

  const vendorPriceIndex = price({
    vendorPrice,
    vendorValuations,
    viewerValuations: vendorValuations,
    buyerBalances,
  });

  return viewerPriceIndex.div(vendorPriceIndex);
};
