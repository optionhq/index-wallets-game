import { bn } from "@/lib/bnMath";
import { price } from "@/lib/indexWallets/price";
import { expect, test } from "vitest";

test("calculates expected price with [1,1,1] vendor valuation and [1,1,1] buyer valuation", () => {
  expect(
    price({
      vendorPrice: bn(5),
      buyerBalances: [bn(10), bn(20), bn(30)],
      vendorValuations: [bn(1), bn(1), bn(1)],
      viewerValuations: [bn(1), bn(1), bn(1)],
    }),
  ).toBeEffectivelyEqual(5);
});

test("calculates expected price with [1,1,1] vendor valuation and [2,2,2] buyer valuation", () => {
  expect(
    price({
      vendorPrice: bn(5),
      vendorValuations: [bn(1), bn(1), bn(1)],
      viewerValuations: [bn(2), bn(2), bn(2)],
      buyerBalances: [bn(10), bn(20), bn(30)],
    }),
  ).toBeEffectivelyEqual(10);
});

test("Right-pads mismatching valuations/balances lengths with zeroes", () => {
  expect(
    price({
      vendorPrice: bn(5),
      vendorValuations: [bn(1)],
      viewerValuations: [bn(2), bn(2)],
      buyerBalances: [bn(10), bn(20), bn(30)],
    }),
  ).toBeEffectivelyEqual(
    price({
      vendorPrice: bn(5),
      vendorValuations: [bn(1), bn(0), bn(0)],
      viewerValuations: [bn(2), bn(2), bn(0)],
      buyerBalances: [bn(10), bn(20), bn(30)],
    }),
  );
});
