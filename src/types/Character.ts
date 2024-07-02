export const allPlayerCharacters: PlayerCharacter[] = [
  "Fork",
  "Spoon",
  "Knife",
  "Ladle",
  "Spatula",
  "Rolling Pin",
  "Grater",
  "Cooking Pot",
  "Cutting Board",
];

export type PlayerCharacter =
  | "Fork"
  | "Spoon"
  | "Knife"
  | "Ladle"
  | "Spatula"
  | "Rolling Pin"
  | "Grater"
  | "Cooking Pot"
  | "Cutting Board";

export type NonPlayerCharacter = "Dealer";

export type Character = PlayerCharacter | NonPlayerCharacter;
