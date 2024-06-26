import { gameIdAtom } from "@/components/Game.state";
import { GameRoom } from "@/components/GameRoom";
import { createFileRoute } from "@tanstack/react-router";
import { getDefaultStore } from "jotai";

export const Route = createFileRoute("/game/$gameId")({
  component: GameRoute,
  onEnter: ({ params: { gameId } }) => {
    getDefaultStore().set(gameIdAtom, gameId);
  },
});

function GameRoute() {
  return <GameRoom />;
}
