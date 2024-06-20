import { Game } from "@/components/Game";
import { gameIdAtom } from "@/components/Game.state";
import { createFileRoute } from "@tanstack/react-router";
import { getDefaultStore } from "jotai";

export const Route = createFileRoute("/game/$gameId")({
  component: GameRoute,
  onEnter: ({ params: { gameId } }) => {
    getDefaultStore().set(gameIdAtom, gameId);
  },
});

function GameRoute() {
  return <Game />;
}
