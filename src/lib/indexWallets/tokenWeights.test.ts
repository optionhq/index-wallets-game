import { bn, bnMath } from "@/lib/bnMath";
import { tokenWeights } from "@/lib/indexWallets/tokenWeights";
import { expect, test } from "vitest";

test("calculates expected balance weights with [1,1,1] valuation", () => {
  expect(tokenWeights([bn(10), bn(20), bn(30)], [bn(1), bn(1), bn(1)])).toEqual(
    [
      bnMath.evaluate("10/60"),
      bnMath.evaluate("20/60"),
      bnMath.evaluate("30/60"),
    ],
  );
});

test("calculates expected balance weights with [1,1,2] valuation", () => {
  expect(tokenWeights([bn(10), bn(20), bn(30)], [bn(1), bn(1), bn(2)])).toEqual(
    [
      bnMath.evaluate("10/90"),
      bnMath.evaluate("20/90"),
      bnMath.evaluate("30/90"),
    ],
  );
});

test("returns infinity weights when denominator is zero", () => {
  expect(tokenWeights([bn(1), bn(0), bn(1)], [bn(0), bn(1), bn(0)])).toEqual([
    bn(Infinity),
    bn(Infinity),
    bn(Infinity),
  ]);
});
