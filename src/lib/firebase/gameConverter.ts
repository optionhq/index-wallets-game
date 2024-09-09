import { bn } from "@/lib/bnMath";
import { playerConverter } from "@/lib/firebase/playerConverter";
import { DbGameData, GameData } from "@/types/GameData";
import { DbPlayer, Player } from "@/types/Player";
import { FirestoreDataConverter } from "firebase/firestore";

export const gameConverter: FirestoreDataConverter<GameData, DbGameData> = {
  fromFirestore: (snapshot, options) => {
    const dbGame = snapshot.data(options) as DbGameData;

    return {
      ...dbGame,
      players: Object.values(dbGame.players).reduce(
        (allPlayers, player) => ({
          ...allPlayers,
          [player.deviceId]: playerConverter.fromFirestore(player),
        }),
        {} as Record<string, Player>,
      ),
      currencies: dbGame.currencies.map((currency) => ({
        ...currency,
        totalSupply: bn(currency.totalSupply),
      })),
    };
  },
  toFirestore: (game: GameData) => {
    return {
      ...game,
      players: Object.values(game.players).reduce(
        (allPlayers, player) => ({
          ...allPlayers,
          [player.deviceId]: playerConverter.toFirestore(player),
        }),
        {} as Record<string, DbPlayer>,
      ),
      currencies: game.currencies.map((currency) => ({
        ...currency,
        totalSupply: currency.totalSupply.toString(),
      })),
    };
  },
};
