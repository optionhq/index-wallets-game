export interface Cause {
  name: string;
  symbol: string;
}

export type CauseSymbol = (typeof allCauses)[number]["symbol"];

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
