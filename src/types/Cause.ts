export interface Cause {
  name: string;
  symbol: CauseSymbol;
}

export type CauseSymbol =
  | "RIVER"
  | "BRIDGE"
  | "WILD"
  | "KIDS"
  | "PUB"
  | "FOREST"
  | "HEAL"
  | "CLEAN"
  | "SEED";

export const allCauses: Cause[] = [
  { name: "Refill Reservoir", symbol: "RIVER" },
  { name: "Fix Burned Bridges", symbol: "BRIDGE" },
  { name: "Rescue Animals", symbol: "WILD" },
  { name: "Care for Kids", symbol: "KIDS" },
  { name: "Rebuild Town Pub", symbol: "PUB" },
  { name: "Regenerate Forests", symbol: "FOREST" },
  { name: "Community Hospital", symbol: "HEAL" },
  { name: "Clean Up the Town", symbol: "CLEAN" },
  { name: "Sow New Crops", symbol: "SEED" },
];

export const cause = allCauses.reduce(
  (causeMap, cause) => ({ ...causeMap, [cause.symbol]: cause }),
  {} as Record<CauseSymbol, Cause>,
);
