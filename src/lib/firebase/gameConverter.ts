import { bn } from "@/lib/bnMath";
import { DbGameData, GameData } from "@/types/Game";
import { FirestoreDataConverter } from "firebase/firestore";

export const gameConverter: FirestoreDataConverter<GameData, DbGameData> = {
  fromFirestore: (snapshot, options) => {
    const dbGame = snapshot.data(options) as DbGameData;

    return {
      ...dbGame,
      players: dbGame.players.map((dbPlayer) => ({
        ...dbPlayer,
        balances: dbPlayer.balances.map((balance) => bn(balance)),
        valuations: dbPlayer.valuations.map((valuation) => bn(valuation)),
      })),
    };
  },
  toFirestore: (game: GameData) => {
    return {
      ...game,
      players: game.players.map((player) => ({
        ...player,
        balances: player.balances.map((balance) => balance.toString()),
        valuations: player.valuations.map((valuation) => valuation.toString()),
      })),
    };
  },
};
