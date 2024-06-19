import { BigNumber } from "mathjs";

export interface Currency {
  name: string;
  symbol: string;
  totalSupply: BigNumber;
}

export interface DbCurrency {
  name: string;
  symbol: string;
  totalSupply: string;
}
