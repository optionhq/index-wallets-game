import { all, create } from "mathjs";

export const bnMath = create(all, {
  number: "BigNumber",
  precision: 64,
  relTol: 1e-60,
  absTol: 1e-63,
});

export const bn = bnMath.bignumber;
