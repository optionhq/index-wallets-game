import {
  deviceIdAtom,
  emitEventAtom,
  gameIdAtom,
  initializeGameAtom,
} from "@/components/Game.state";
import { TokenBadge } from "@/components/TokenBadge";
import { Button } from "@/components/ui/button";
import { bn } from "@/lib/bnMath";
import { cn } from "@/lib/cn";
import {
  allCauses,
  CauseSymbol,
  cause as causeWithSymbol,
} from "@/types/Cause";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";

export const GameSetup = () => {
  const gameId = useAtomValue(gameIdAtom);
  const createGame = useSetAtom(initializeGameAtom);
  const deviceId = useAtomValue(deviceIdAtom);
  const emitEvent = useSetAtom(emitEventAtom);
  const [selectedCauses, setSelectedCauses] = useState<CauseSymbol[]>([]);
  return (
    <div className="flex w-full flex-col items-center gap-2 p-2">
      <p>Pick the causes</p>

      <div className="grid grid-cols-3 gap-1">
        {allCauses.map((cause) => (
          <Button
            key={cause.symbol}
            onClick={() => {
              if (selectedCauses.includes(cause.symbol))
                setSelectedCauses(
                  selectedCauses.filter((c) => c !== cause.symbol),
                );
              else setSelectedCauses([...selectedCauses, cause.symbol]);
            }}
            variant="outline"
            className={cn(
              "flex h-40 w-full flex-col justify-between gap-1 text-wrap",
              selectedCauses.includes(cause.symbol) &&
                "border-primary bg-primary/20 hover:bg-primary/30",
            )}
          >
            <p className="flex-grow">{cause.name}</p>
            <TokenBadge className="size-16" token={cause.symbol} />
            <p className="font-bold text-muted-foreground">${cause.symbol}</p>
          </Button>
        ))}
      </div>
      <Button
        size={"lg"}
        className="w-full text-lg"
        disabled={selectedCauses.length === 0}
        onClick={() => {
          createGame({
            causes: selectedCauses,
            id: gameId,
          });
          emitEvent({
            type: "GAME_CREATED",
            dealerId: deviceId,
            currencies: [
              { name: "USD", symbol: "USD", totalSupply: bn(0) },
              ...selectedCauses.map((cause) => ({
                name: causeWithSymbol[cause].name,
                symbol: cause,
                totalSupply: bn(0),
              })),
            ],
          });
        }}
      >
        {selectedCauses.length > 0 ? "Create game" : "Pick at least one cause"}
      </Button>
    </div>
  );
};
