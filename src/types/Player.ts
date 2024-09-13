import { CauseSymbol } from "@/types/Cause";
import { Character } from "@/types/Character";
import { DocumentData } from "firebase/firestore";
import { BigNumber } from "mathjs";

export interface Player {
  index: number;
  deviceId: string;
  name: string;
  balances: BigNumber[];
  valuations: BigNumber[];
  character: Character;
  retailPrice: BigNumber;
}

export interface DbPlayer extends DocumentData {
  index: number;
  deviceId: string;
  name: string;
  balances: string[];
  valuations: string[];
  character: Character;
}
