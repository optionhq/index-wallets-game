import indexWalletsLogo from "@/assets/img/index-wallets-mono.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useFirestore } from "@/lib/firebase/useFirestore";
import { generateId } from "@/lib/generateId";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useCallback, useState } from "react";

export const Lobby = () => {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState<string>("");
  const firestore = useFirestore();
  const createGame = useCallback(async () => {
    const gameId = generateId();
    await setDoc(doc(firestore, "games", gameId), {
      createdAt: serverTimestamp(),
      players: [
        {
          deviceId: "9ddba007-a4a4-40c1-90a6-3ba7c2ca8cfd",
          name: "Connor",
          balances: ["100", "20", "0", "0"],
          valuations: ["1", "1", "0", "0"],
          cause: "RIVER",
        },
        {
          deviceId: "519dddc1-a3dc-4bb7-86de-7c01a2f5e69a",
          name: "Will",
          balances: ["100", "20", "0", "0"],
          valuations: ["1", "1", "0", "0"],
          cause: "RIVER",
        },
        {
          deviceId: "6e6ac296-44c8-434f-9533-5fea9f59c577",
          name: "Lauren",
          balances: ["100", "0", "20", "0"],
          valuations: ["1", "0", "1", "0"],
          cause: "POLLI",
        },
        {
          deviceId: "069788d9-efa7-43c3-afd2-73fc2e7a1294",
          name: "Julian",
          balances: ["100", "0", "0", "20"],
          valuations: ["1", "0", "0", "1"],
          cause: "PARK",
        },
      ],
      currencies: [
        { name: "US Dollars", symbol: "USD", totalSupply: "0" },
        { name: "River Cleanup", symbol: "RIVER", totalSupply: "40" },
        { name: "Save Pollinators", symbol: "POLLI", totalSupply: "20" },
        { name: "Parks & Trails", symbol: "PARK", totalSupply: "20" },
      ],
    }).then(() => navigate({ to: `/game/${gameId}`, params: { gameId } }));
  }, [firestore, navigate]);

  const { data: gameExists } = useQuery({
    queryKey: ["game", gameId.toUpperCase()],
    queryFn: async ({ queryKey: [, gameId] }) => {
      if (gameId.length !== 6) return false;

      return (await getDoc(doc(firestore, "games", gameId))).exists();
    },
  });

  return (
    <div className="h-full flex flex-col justify-evenly items-center p-4 ">
      <div className="flex items-center gap-2 h-min">
        <h1 className="flex flex-col w-fit">
          <span className="text-3xl font-bold leading-none">Index Wallets</span>
          <span className="text-2xl self-end font-bold leading-none">
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
          className="h-16 w-full font-mono text-center uppercase font-bold text-xl tracking-widest"
        />
        <Button
          disabled={!gameExists}
          size="lg"
          className={cn("font-bold text-lg w-full")}
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
        <Button onClick={createGame} variant="link" size="lg" className="h-fit">
          Create game
        </Button>
      </div>
    </div>
  );
};
