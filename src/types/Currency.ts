import { CauseSymbol } from "@/types/Cause";
import { BigNumber } from "mathjs";

export interface Currency {
  name: string;
  symbol: CauseSymbol | "USD";
  totalSupply: BigNumber;
}

export interface DbCurrency {
  name: string;
  symbol: CauseSymbol | "USD";
  totalSupply: string;
}
