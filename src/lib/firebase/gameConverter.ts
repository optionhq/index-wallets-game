import { bn } from "@/lib/bnMath";
import { playerConverter } from "@/lib/firebase/playerConverter";
import { DbGameData, GameData } from "@/types/GameData";
import { FirestoreDataConverter } from "firebase/firestore";

export const gameConverter: FirestoreDataConverter<GameData, DbGameData> = {
  fromFirestore: (snapshot, options) => {
    const dbGame = snapshot.data(options) as DbGameData;

    return {
      ...dbGame,
      players: dbGame.players.map(playerConverter.fromFirestore),
      currencies: dbGame.currencies.map((currency) => ({
        ...currency,
        totalSupply: bn(currency.totalSupply),
      })),
    };
  },
  toFirestore: (game: GameData) => {
    return {
      ...game,
      players: game.players.map(playerConverter.toFirestore),
      currencies: game.currencies.map((currency) => ({
        ...currency,
        totalSupply: currency.totalSupply.toString(),
      })),
    };
  },
};
