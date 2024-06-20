import { CauseSymbol } from "@/types/Cause";
import { DocumentData } from "firebase/firestore";
import { BigNumber } from "mathjs";

export interface Player {
  deviceId: string;
  name: string;
  balances: BigNumber[];
  valuations: BigNumber[];
  cause?: CauseSymbol;
}

export interface DbPlayer extends DocumentData {
  deviceId: string;
  name: string;
  balances: string[];
  valuations: string[];
  cause?: CauseSymbol;
}
