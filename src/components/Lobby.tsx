import indexWalletsLogo from "@/assets/img/index-wallets-mono.png";
import {
  deviceIdAtom,
  emitEvent,
  initializeGameAtom,
} from "@/components/Game.state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useFirestore } from "@/lib/firebase/useFirestore";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { doc, getDoc } from "firebase/firestore";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";

export const Lobby = () => {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState<string>("");
  const firestore = useFirestore();

  const playerId = useAtomValue(deviceIdAtom);
  const createGame = useSetAtom(initializeGameAtom);

  const { data: gameExists } = useQuery({
    queryKey: ["game", gameId.toUpperCase()],
    queryFn: async ({ queryKey: [, gameId] }) => {
      if (gameId.length !== 6) return false;

      return (await getDoc(doc(firestore, "games", gameId))).exists();
    },
  });

  return (
    <div className="flex h-full flex-col items-center justify-evenly p-4">
      <div className="flex h-min items-center gap-2">
        <h1 className="flex w-fit flex-col">
          <span className="text-3xl font-bold leading-none">Index Wallets</span>
          <span className="self-end text-2xl font-bold leading-none">
            The Game
          </span>
        </h1>
        <img src={indexWalletsLogo} className="w-10" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p>Input game code to join</p>
        <Input
          placeholder="______"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && gameId.length === 6) {
              navigate({
                to: `/game/${gameId.toUpperCase()}`,
                params: { gameId },
              });
            }
          }}
          type="text"
          maxLength={6}
          className="h-16 w-full text-center font-mono text-xl font-bold uppercase tracking-widest"
        />
        <Button
          disabled={!gameExists}
          size="lg"
          className={cn("w-full text-lg font-bold")}
          onClick={() =>
            navigate({
              to: `/game/${gameId.toUpperCase()}`,
              params: { gameId },
            })
          }
        >
          Join
        </Button>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-foreground/50">or</p>
        <Button
          onClick={() =>
            createGame().then((gameId) => {
              emitEvent(gameId, { type: "GAME_CREATED", dealerId: playerId });
              navigate({ to: `/game/${gameId}`, params: { gameId } });
            })
          }
          variant="link"
          size="lg"
          className="h-fit"
        >
          Create game
        </Button>
      </div>
    </div>
  );
};
