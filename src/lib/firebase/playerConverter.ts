import { bn } from "@/lib/bnMath";
import { DbPlayer, Player } from "@/types/Player";

export const playerConverter = {
  fromFirestore: (player: DbPlayer) =>
    ({
      ...player,
      balances: player.balances.map((balance) => bn(balance)),
      valuations: player.valuations.map((valuation) => bn(valuation)),
      retailPrice: player.retailPrice ? bn(player.retailPrice) : undefined,
    }) as Player,

  toFirestore: (player: Player) =>
    ({
      ...player,
      balances: player.balances.map((balance) => balance.toString()),
      valuations: player.valuations.map((valuation) => valuation.toString()),
      retailPrice: player.retailPrice?.toString(),
    }) as DbPlayer,
};
