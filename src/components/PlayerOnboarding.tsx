import { CharacterBadge } from "@/components/CharacterBadge";
import {
  deviceIdAtom,
  emitEventAtom,
  gameAtom,
  otherPlayersAtom,
} from "@/components/Game.state";
import { TokenBadge } from "@/components/TokenBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bn } from "@/lib/bnMath";
import { CauseSymbol, allCauses, cause } from "@/types/Cause";
import { Character, allPlayerCharacters } from "@/types/Character";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { times } from "remeda";
import { toast } from "sonner";

export const PlayerOnboarding = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const [chosenPlayerName, setChosenPlayerName] = useState<string | undefined>(
    undefined,
  );
  const [playerCause, setPlayerCause] = useState<CauseSymbol | undefined>(
    undefined,
  );

  const [playerCharacter, setPlayerCharacter] = useState<Character | undefined>(
    undefined,
  );
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
    <div className="h-full flex flex-col justify-evenly items-center p-2 ">
      {!chosenPlayerName && (
        <div className="flex flex-col items-center gap-2 w-full max-w-64">
          <p>Enter your name</p>
          <Input
            maxLength={20}
            className="h-16 w-full  text-lg "
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

      {chosenPlayerName && !playerCharacter && (
        <div className="flex flex-col items-center p-2 gap-2 w-full">
          <p>Hey {chosenPlayerName}!</p>
          <p>Pick your character</p>

          <div className="grid grid-cols-3 gap-1">
            {allPlayerCharacters.map((character) => (
              <Button
                disabled={chosenCharacters.includes(character)}
                key={character}
                onClick={() => setPlayerCharacter(character)}
                variant="outline"
                className="flex flex-col gap-1 justify-around w-full text-wrap h-32"
              >
                <p className="flex-grow capitalize">{character}</p>
                <CharacterBadge className="size-16" character={character} />
              </Button>
            ))}
          </div>

          <Button
            variant="link"
            className="text-muted-foreground"
            onClick={() => setChosenPlayerName(undefined)}
          >
            Change name
          </Button>
        </div>
      )}

      {chosenPlayerName && playerCharacter && !playerCause && (
        <div className="flex flex-col items-center gap-2 p-2 w-full">
          <div className="flex flex-col items-center">
            <p>{chosenPlayerName}</p>
            <CharacterBadge className="size-16" character={playerCharacter} />
          </div>
          <p>Pick your cause</p>

          <div className="grid grid-cols-3 gap-1">
            {allCauses.map((cause) => (
              <Button
                key={cause.symbol}
                onClick={() => setPlayerCause(cause.symbol)}
                variant="outline"
                className="flex flex-col justify-between gap-1 w-full text-wrap h-40"
              >
                <p className="flex-grow">{cause.name}</p>
                <TokenBadge className="size-16" token={cause.symbol} />
                <p className="font-bold text-muted-foreground">
                  ${cause.symbol}
                </p>
              </Button>
            ))}
          </div>

          <Button
            variant="link"
            className="text-muted-foreground"
            onClick={() => setPlayerCharacter(undefined)}
          >
            Change character
          </Button>
        </div>
      )}

      {chosenPlayerName && playerCharacter && playerCause && (
        <div className="flex flex-col items-center p-2 gap-10 w-full">
          <div className="flex flex-col items-center">
            <p className="text-muted-foreground">{chosenPlayerName}</p>
            <CharacterBadge className="size-24" character={playerCharacter} />
          </div>
          <div className="flex flex-col gap-2">
            <p>You've decided to support</p>
            <div className="flex flex-col justify-between items-center gap-3 border rounded-lg p-4 text-wrap">
              <p className="text-lg">{cause[playerCause].name}</p>
              <TokenBadge className="size-16" token={playerCause} />
              <p className="font-bold text-muted-foreground">
                ${cause[playerCause].symbol}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full px-4">
            <Button
              variant="link"
              className="text-muted-foreground h-fit p-0"
              onClick={() => setPlayerCause(undefined)}
            >
              Pick another cause
            </Button>
            <Button
              size="lg"
              className="w-full text-lg font-bold h-14"
              onClick={() =>
                updateGame((game) => {
                  if (
                    !game.currencies.find(
                      (currency) => currency.symbol === playerCause,
                    )
                  ) {
                    game.currencies.push({
                      ...cause[playerCause],
                      totalSupply: bn("0"),
                    });

                    game.players.forEach((player) => {
                      player.balances.push(bn("0"));
                      player.valuations.push(bn("0"));
                    });
                  }

                  const amountOfCurrencies = game.currencies.length;
                  const playerCauseIndex = game.currencies.findIndex(
                    (currency) => currency.symbol === playerCause,
                  );

                  const newPlayer = {
                    deviceId,
                    name: chosenPlayerName,
                    balances: [
                      bn("100"),
                      ...times(amountOfCurrencies - 1, () => bn("0")),
                    ],
                    valuations: [
                      bn("1"),
                      ...times(amountOfCurrencies - 1, (index) =>
                        index + 1 === playerCauseIndex ? bn("1") : bn("0"),
                      ),
                    ],
                    cause: playerCause,
                    character: playerCharacter,
                  };

                  game.players.push(newPlayer);

                  emitEvent({ type: "PLAYER_JOINED", ...newPlayer });
                })
              }
            >
              Join game
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
