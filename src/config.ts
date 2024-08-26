import { DollarSignIcon } from "lucide-react";
import BridgeIcon from "./assets/img/cause-tokens/Bridge.svg?react";
import DogIcon from "./assets/img/cause-tokens/Dog.svg?react";
import ForestIcon from "./assets/img/cause-tokens/Forest.svg?react";
import HospitalIcon from "./assets/img/cause-tokens/Hospital.svg?react";
import HousesIcon from "./assets/img/cause-tokens/Houses.svg?react";
import KidIcon from "./assets/img/cause-tokens/Kid.svg?react";
import PubIcon from "./assets/img/cause-tokens/Pub.svg?react";
import RiverIcon from "./assets/img/cause-tokens/River.svg?react";
import SeedlingIcon from "./assets/img/cause-tokens/Seedling.svg?react";

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

import { bn } from "@/lib/bnMath";
import { Character } from "@/types/Character";
import { CurrencySymbol } from "@/types/Currency";
import { FC, SVGProps } from "react";

export const VALUATION_AMPLITUDE = 2;

export const tokenColor = {
  RIVER: "#3C8FCA",
  BRIDGE: "#D96666",
  WILD: "#A277C4",
  KIDS: "#65C5CB",
  PUB: "#EDA059",
  FOREST: "#62835C",
  HEAL: "#D566A9",
  CLEAN: "#EACD65",
  SEED: "#6FC69C",
  USD: "#555",
} as { [cause in CurrencySymbol]: `#${string}` };

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
  Dealer: "#555",
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
  BRIDGE: BridgeIcon,
  WILD: DogIcon,
  KIDS: KidIcon,
  PUB: PubIcon,
  FOREST: ForestIcon,
  HEAL: HospitalIcon,
  CLEAN: HousesIcon,
  SEED: SeedlingIcon,
  // RIVER: RiverIcon,
  // FOOD: FoodIcon,
  // PET: DogIcon,
  // ELDER: ElderIcon,
  // SOCIAL: CouchIcon,
  // PARK: ParkIcon,
  // HOME: TentIcon,
  // POLLEN: ButterflyIcon,
  // GARDEN: SeedlingIcon,
} as { [cause in CurrencySymbol]: FC<SVGProps<SVGSVGElement>> };

export const INITIAL_USD_BALANCE = 100;

export const DONATION_PRICE = 20;

export const DONATION_REWARD = 20;

export const MARKET_VALUATIONS_WINDOW_LENGTH = 10;

export const INITIAL_RETAIL_PRICE = 10;

export const CAUSE_VALUATIONS = [bn(1)];
