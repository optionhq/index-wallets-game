export interface Cause {
  name: string;
  symbol: CauseSymbol;
}

export type CauseSymbol =
  | "RIVER"
  | "FOOD"
  | "PET"
  | "ELDER"
  | "SOCIAL"
  | "PARK"
  | "HOME"
  | "POLLEN"
  | "GARDEN";

export const allCauses: Cause[] = [
  { name: "River Cleanup", symbol: "RIVER" },
  { name: "End Hunger", symbol: "FOOD" },
  { name: "Animal Rescue", symbol: "PET" },
  { name: "Elder Care", symbol: "ELDER" },
  { name: "Social Space", symbol: "SOCIAL" },
  { name: "Parks & Trails", symbol: "PARK" },
  { name: "End Homelessness", symbol: "HOME" },
  { name: "Save Pollinators", symbol: "POLLEN" },
  { name: "Community Gardens", symbol: "GARDEN" },
];

export const cause = allCauses.reduce(
  (causeMap, cause) => ({ ...causeMap, [cause.symbol]: cause }),
  {} as Record<CauseSymbol, Cause>,
);
