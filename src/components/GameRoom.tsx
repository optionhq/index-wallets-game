import { Game } from "@/components/Game";
import {
  maybeCurrentAgentAtom,
  maybeGameAtom,
  updateProvisionalValuationsEffect,
} from "@/components/Game.state";
import { PlayerOnboarding } from "@/components/PlayerOnboarding";

import { useAtomValue } from "jotai";

export const GameRoom = () => {
  const game = useAtomValue(maybeGameAtom);
  useAtomValue(updateProvisionalValuationsEffect);
  const currentPlayer = useAtomValue(maybeCurrentAgentAtom);

  if (!game) {
    return (
      <div className="h-full flex flex-col justify-evenly items-center p-4 ">
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentPlayer) {
    return <PlayerOnboarding />;
  }

  return <Game />;
};
