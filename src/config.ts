import { DollarSignIcon } from "lucide-react";
import ButterflyIcon from "./assets/img/cause-tokens/Butterfly.svg?react";
import CouchIcon from "./assets/img/cause-tokens/Couch.svg?react";
import DogIcon from "./assets/img/cause-tokens/Dog.svg?react";
import ElderIcon from "./assets/img/cause-tokens/Elder.svg?react";
import FoodIcon from "./assets/img/cause-tokens/Food.svg?react";
import ParkIcon from "./assets/img/cause-tokens/Park.svg?react";
import RiverIcon from "./assets/img/cause-tokens/River.svg?react";
import SeedlingIcon from "./assets/img/cause-tokens/Seedling.svg?react";
import TentIcon from "./assets/img/cause-tokens/Tent.svg?react";

import potIcon from "@/assets/img/player-tokens/cooking-pot.png";
import boardIcon from "@/assets/img/player-tokens/cutting-board.png";
import dealerIcon from "@/assets/img/player-tokens/dealer.png";
import forkIcon from "@/assets/img/player-tokens/fork.png";
import graterIcon from "@/assets/img/player-tokens/grater.png";
import knifeIcon from "@/assets/img/player-tokens/knife.png";
import ladleIcon from "@/assets/img/player-tokens/ladle.png";
import rollingPinIcon from "@/assets/img/player-tokens/rolling-pin.png";
import spatulaIcon from "@/assets/img/player-tokens/spatula.png";
import spoonIcon from "@/assets/img/player-tokens/spoon.png";

import { CauseSymbol } from "@/types/Cause";
import { Character } from "@/types/Character";
import { FC, SVGProps } from "react";

export const VALUATION_AMPLITUDE = 2;

export const causeColor = {
  RIVER: "#3C8FCA",
  FOOD: "#D96666",
  PET: "#A277C4",
  ELDER: "#65C5CB",
  SOCIAL: "#EDA059",
  PARK: "#62835C",
  HOME: "#D566A9",
  POLLEN: "#EACD65",
  GARDEN: "#6FC69C",
  USD: "#333",
} as { [cause in CauseSymbol | "USD"]: `#${string}` };

export const characterColor = {
  Knife: "#3C8FCA",
  Spoon: "#D96666",
  Fork: "#A277C4",
  Ladle: "#65C5CB",
  Spatula: "#EDA059",
  "Rolling Pin": "#62835C",
  Grater: "#D566A9",
  "Cooking Pot": "#EACD65",
  "Cutting Board": "#6FC69C",
  Dealer: "#333",
} as { [character in Character]: `#${string}` };

export const characterIcon = {
  Knife: knifeIcon,
  Spoon: spoonIcon,
  Fork: forkIcon,
  Ladle: ladleIcon,
  Spatula: spatulaIcon,
  "Rolling Pin": rollingPinIcon,
  Grater: graterIcon,
  "Cooking Pot": potIcon,
  "Cutting Board": boardIcon,
  Dealer: dealerIcon,
} as { [character in Character]: string };

export const causeIcon = {
  USD: DollarSignIcon,
  RIVER: RiverIcon,
  FOOD: FoodIcon,
  PET: DogIcon,
  ELDER: ElderIcon,
  SOCIAL: CouchIcon,
  PARK: ParkIcon,
  HOME: TentIcon,
  POLLEN: ButterflyIcon,
  GARDEN: SeedlingIcon,
} as { [cause in CauseSymbol | "USD"]: FC<SVGProps<SVGSVGElement>> };
