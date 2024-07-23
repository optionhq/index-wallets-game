import { bn, bnMath } from "@/lib/bnMath";
import { compositePrice } from "@/lib/indexWallets/compositePrice";
import { expect, test } from "vitest";

test("calculates expected composite price with [1,1,1] valuation", () => {
  expect(
    compositePrice({
      vendorPrice: bn(5),
      buyerBalances: [bn(10), bn(20), bn(30)],
      vendorValuations: [bn(1), bn(1), bn(1)],
    }),
  ).toBeEffectivelyEqual([
    bnMath.evaluate("5 * 10/60"),
    bnMath.evaluate("5 * 20/60"),
    bnMath.evaluate("5 * 30/60"),
  ]);
});

test("calculates expected composite price with [1,1,2] valuation", () => {
  expect(
    compositePrice({
      vendorPrice: bn(5),
      buyerBalances: [bn(10), bn(20), bn(30)],
      vendorValuations: [bn(1), bn(1), bn(2)],
    }),
  ).toBeEffectivelyEqual([
    bnMath.evaluate("5 * 10/90"),
    bnMath.evaluate("5 * 20/90"),
    bnMath.evaluate("5 * 30/90"),
  ]);
});

test("Right-pads mismatching valuations/balances lengths with zeroes", () => {
  expect(
    compositePrice({
      vendorPrice: bn(5),
      vendorValuations: [bn(1)],
      buyerBalances: [bn(10), bn(20), bn(30)],
    }),
  ).toBeEffectivelyEqual(
    compositePrice({
      vendorPrice: bn(5),
      vendorValuations: [bn(1), bn(0), bn(0)],
      buyerBalances: [bn(10), bn(20), bn(30)],
    }),
  );
});