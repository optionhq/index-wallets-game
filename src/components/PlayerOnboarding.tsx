import { CharacterIcon } from "@/components/CharacterIcon";
import {
  deviceIdAtom,
  emitEventAtom,
  gameAtom,
  otherPlayersAtom,
} from "@/components/Game.state";
import { TokenBadge } from "@/components/TokenBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INITIAL_USD_BALANCE } from "@/config";
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

      {chosenPlayerName && !playerCharacter && (
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
                className="flex h-32 w-full flex-col justify-around gap-1 text-wrap"
              >
                <p className="flex-grow capitalize">{character}</p>
                <CharacterIcon className="size-16" character={character} />
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
        <div className="flex w-full flex-col items-center gap-2 p-2">
          <div className="flex flex-col items-center">
            <p>{chosenPlayerName}</p>
            <CharacterIcon className="size-16" character={playerCharacter} />
          </div>
          <p>Pick your cause</p>

          <div className="grid grid-cols-3 gap-1">
            {allCauses.map((cause) => (
              <Button
                key={cause.symbol}
                onClick={() => setPlayerCause(cause.symbol)}
                variant="outline"
                className="flex h-40 w-full flex-col justify-between gap-1 text-wrap"
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
        <div className="flex w-full flex-col items-center gap-10 p-2">
          <div className="flex flex-col items-center">
            <p className="text-muted-foreground">{chosenPlayerName}</p>
            <CharacterIcon className="size-24" character={playerCharacter} />
          </div>
          <div className="flex flex-col gap-2">
            <p>You've decided to support</p>
            <div className="flex flex-col items-center justify-between gap-3 text-wrap rounded-lg border p-4">
              <p className="text-lg">{cause[playerCause].name}</p>
              <TokenBadge className="size-16" token={playerCause} />
              <p className="font-bold text-muted-foreground">
                ${cause[playerCause].symbol}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 px-4">
            <Button
              variant="link"
              className="h-fit p-0 text-muted-foreground"
              onClick={() => setPlayerCause(undefined)}
            >
              Pick another cause
            </Button>
            <Button
              size="lg"
              className="h-14 w-full text-lg font-bold"
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

                    for (const player of Object.values(game.players)) {
                      player.balances.push(bn("0"));
                      player.valuations.push(bn("0"));
                    }
                  }

                  const amountOfCurrencies = game.currencies.length;
                  const playerCauseIndex = game.currencies.findIndex(
                    (currency) => currency.symbol === playerCause,
                  );

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
                      ...times(amountOfCurrencies - 1, (index) =>
                        index + 1 === playerCauseIndex ? bn("1") : bn("0"),
                      ),
                    ],
                    cause: playerCause,
                    character: playerCharacter,
                    retailPrice: bn(10),
                  };

                  game.players[deviceId] = newPlayer;

                  game.currencies[0].totalSupply =
                    game.currencies[0].totalSupply.add(INITIAL_USD_BALANCE);

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
