import { CauseSymbol } from "@/types/Cause";
import { BigNumber } from "mathjs";

export type CurrencySymbol = CauseSymbol | "USD";

export interface Currency {
  name: string;
  symbol: CurrencySymbol;
  totalSupply: BigNumber;
}

export interface DbCurrency {
  name: string;
  symbol: CauseSymbol | "USD";
  totalSupply: string;
}
