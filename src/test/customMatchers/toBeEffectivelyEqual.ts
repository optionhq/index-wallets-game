import { bnMath } from "@/lib/bnMath";
import { expect } from "vitest";

expect.extend({
  toBeEffectivelyEqual: (received, expected) => ({
    message: () =>
      `expected ${received} to be effectively equal to ${expected}`,
    pass: bnMath.equal(received, expected) as boolean,
  }),
});
