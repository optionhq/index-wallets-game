import { MathType } from "mathjs";
import "vitest";

interface CustomMatchers<R = unknown> {
  toBeEffectivelyEqual: (expected: MathType) => R;
}

declare module "vitest" {
  interface Assertion<T> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
