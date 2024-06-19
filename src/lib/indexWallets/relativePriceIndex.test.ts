import { bn } from "@/lib/bnMath";
import { relativePriceIndex } from "@/lib/indexWallets/relativePriceIndex";
import { expect, test } from "vitest";

test("if viewer and vendor have the same valuations, should be 1", () => {
  expect(
    relativePriceIndex({
      buyerBalances: [bn(10), bn(20), bn(30)],
      vendorValuations: [bn(1), bn(1), bn(1)],
      viewerValuations: [bn(1), bn(1), bn(1)],
    })
  ).toBeEffectivelyEqual(1);
});

test("if viewer values all tokens twice as much as vendor, should be 2", () => {
  expect(
    relativePriceIndex({
      buyerBalances: [bn(10), bn(20), bn(30)],
      vendorValuations: [bn(1), bn(1), bn(1)],
      viewerValuations: [bn(2), bn(2), bn(2)],
    })
  ).toBeEffectivelyEqual(2);
});

test("if vendor values all tokens twice as much as viewer, should be 1/2", () => {
  expect(
    relativePriceIndex({
      buyerBalances: [bn(10), bn(20), bn(30)],
      vendorValuations: [bn(2), bn(2), bn(2)],
      viewerValuations: [bn(1), bn(1), bn(1)],
    })
  ).toBeEffectivelyEqual(0.5);
});
