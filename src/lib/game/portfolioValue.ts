import { Player } from "@/types/Player";
import { dotMultiply, sum } from "mathjs";

export const portfolioValue = (player: Player) =>
  sum(dotMultiply(player.balances, player.valuations));
