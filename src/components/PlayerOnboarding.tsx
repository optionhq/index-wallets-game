import { CharacterIcon } from "@/components/CharacterIcon";
import {
  deviceIdAtom,
  emitEventAtom,
  gameAtom,
  otherPlayersAtom,
} from "@/components/Game.state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INITIAL_USD_BALANCE } from "@/config";
import { bn } from "@/lib/bnMath";
import { cn } from "@/lib/cn";
import { Character, allPlayerCharacters } from "@/types/Character";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { times } from "remeda";
import { toast } from "sonner";

const chosenPlayerNameAtom = atom<string | undefined>(undefined);
const playerCharacterAtom = atom<Character | undefined>(undefined);

export const PlayerOnboarding = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const [chosenPlayerName, setChosenPlayerName] = useAtom(chosenPlayerNameAtom);

  const [playerCharacter, setPlayerCharacter] = useAtom(playerCharacterAtom);
  const updateGame = useSetAtom(gameAtom);
  const players = useAtomValue(otherPlayersAtom);
  const chosenCharacters = useMemo(
    () => players.map((p) => p.character),
    [players],
  );

  useEffect(() => {
    if (!playerCharacter) return;
    if (!chosenCharacters.includes(playerCharacter)) return;

    setPlayerCharacter(undefined);
    toast.warning(`Someone else chose ${playerCharacter}. Pick another one.`);
  }, [chosenCharacters, playerCharacter]);
  const deviceId = useAtomValue(deviceIdAtom);
  const emitEvent = useSetAtom(emitEventAtom);
  return (
    <div className="flex h-full flex-col items-center justify-evenly p-2">
      {!chosenPlayerName && (
        <div className="flex w-full max-w-64 flex-col items-center gap-2">
          <p>Enter your name</p>
          <Input
            maxLength={20}
            className="h-16 w-full text-lg"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && playerName.length >= 2)
                setChosenPlayerName(playerName);
            }}
          />
          <Button
            disabled={playerName.length < 2}
            size="lg"
            className="w-full text-lg"
            onClick={() => setChosenPlayerName(playerName)}
          >
            Next
          </Button>
        </div>
      )}

      {chosenPlayerName && (
        <div className="flex w-full flex-col items-center gap-2 p-2">
          <p>Hey {chosenPlayerName}!</p>
          <p>Pick your character</p>

          <div className="grid grid-cols-3 gap-1">
            {allPlayerCharacters.map((character) => (
              <Button
                disabled={chosenCharacters.includes(character)}
                key={character}
                onClick={() => setPlayerCharacter(character)}
                variant="outline"
                className={cn(
                  "flex h-32 w-full flex-col justify-around gap-1 text-wrap",
                  playerCharacter === character &&
                    "border-primary bg-primary/20 hover:bg-primary/30",
                )}
              >
                <p className="flex-grow capitalize">{character}</p>
                <CharacterIcon className="size-16" character={character} />
              </Button>
            ))}
          </div>

          <Button
            size="lg"
            className="h-14 w-full text-lg font-bold"
            disabled={!playerCharacter}
            onClick={() =>
              updateGame((game) => {
                const amountOfCurrencies = game.currencies.length;

                const newPlayer = {
                  index: Object.values(game.players).length,
                  deviceId,
                  name: chosenPlayerName,
                  balances: [
                    bn(INITIAL_USD_BALANCE),
                    ...times(amountOfCurrencies - 1, () => bn("0")),
                  ],
                  valuations: [
                    bn("1"),
                    ...times(amountOfCurrencies - 1, () => bn("0")),
                  ],
                  character: playerCharacter!,
                  retailPrice: bn(10),
                };

                game.players[deviceId] = newPlayer;

                game.currencies[0].totalSupply =
                  game.currencies[0].totalSupply.add(INITIAL_USD_BALANCE);

                emitEvent({ type: "PLAYER_JOINED", ...newPlayer });
              })
            }
          >
            {playerCharacter ? "Join game" : "Pick a character"}
          </Button>

          <Button
            variant="link"
            className="text-muted-foreground"
            onClick={() => setChosenPlayerName(undefined)}
          >
            Change name
          </Button>
        </div>
      )}
    </div>
  );
};
