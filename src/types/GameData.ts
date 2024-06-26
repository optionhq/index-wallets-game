import { Currency, DbCurrency } from "@/types/Currency";
import { DbPlayer, Player } from "@/types/Player";
import { DocumentData, Timestamp } from "firebase/firestore";

export interface GameData {
  createdAt: Timestamp;
  players: Player[];
  currencies: Currency[];
}

export interface DbGameData extends DocumentData {
  createdAt: Timestamp;
  players: DbPlayer[];
  currencies: DbCurrency[];
}
