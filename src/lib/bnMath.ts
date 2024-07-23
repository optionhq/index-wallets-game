import {
  absDependencies,
  BigNumber,
  bignumberDependencies,
  create,
  divideDependencies,
  dotDivideDependencies,
  evaluateDependencies,
  minDependencies,
  multiplyDependencies,
  subtractDependencies,
  sumDependencies,
} from "mathjs";

export const bnMath = create(
  {
    absDependencies,
    bignumberDependencies,
    multiplyDependencies,
    dotDivideDependencies,
    sumDependencies,
    subtractDependencies,
    evaluateDependencies,
    divideDependencies,
    minDependencies,
  },
  {
    number: "BigNumber",
    precision: 64,
    relTol: 1e-60,
    absTol: 1e-63,
  },
);

export const bn = bnMath.bignumber;

export const bnZeroPad = (vector: BigNumber[], length: number) =>
  vector.concat(Array(length - vector.length).fill(bn(0)));

export const bnStringify = (bn: BigNumber) => bn.toString();
