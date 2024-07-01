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

import { CauseSymbol } from "@/types/Cause";
import { FC, SVGProps } from "react";

export const VALUATION_AMPLITUDE = 2;

export const tokenColor = {
  RIVER: "#3C8FCA",
  FOOD: "#D96666",
  PET: "#A277C4",
  ELDER: "#65C5CB",
  SOCIAL: "#EDA059",
  PARK: "#62835C",
  HOME: "#D566A9",
  POLLEN: "#EACD65",
  GARDEN: "#6FC69C",
  USD: "#000000",
} as { [cause in CauseSymbol | "USD"]: string };

export const tokenIcon = {
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
