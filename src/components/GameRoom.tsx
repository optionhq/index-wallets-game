import { Game } from "@/components/Game";
import {
  maybeCurrentAgentAtom,
  maybeGameAtom,
  updateProvisionalPriceEffect,
  updateProvisionalValuationsEffect,
} from "@/components/Game.state";
import { GameSetup } from "@/components/GameSetup";
import { PlayerOnboarding } from "@/components/PlayerOnboarding";

import { useAtomValue } from "jotai";

export const GameRoom = () => {
  const game = useAtomValue(maybeGameAtom);
  useAtomValue(updateProvisionalValuationsEffect);
  useAtomValue(updateProvisionalPriceEffect);
  const currentPlayer = useAtomValue(maybeCurrentAgentAtom);

  if (game === undefined) {
    return (
      <div className="flex h-full flex-col items-center justify-evenly p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (game === null) {
    return <GameSetup />
  }

  if (!currentPlayer) {
    return <PlayerOnboarding />;
  }

  return <Game />;
};
