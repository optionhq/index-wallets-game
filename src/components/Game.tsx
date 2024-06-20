import { CauseToken } from "@/components/CauseToken";
import {
  activeTabAtom,
  deviceIdAtom,
  gameAtom,
  maybeCurrentPlayerAtom,
  maybeGameAtom,
  updateProvisionalValuationsEffect,
} from "@/components/Game.state";
import { CausesTab } from "@/components/tabs/Causes/CausesTab";
import { PayTab } from "@/components/tabs/Pay/PayTab";
import { ValuationsTab } from "@/components/tabs/Valuations/ValuationsTab";
import { WalletTab } from "@/components/tabs/Wallet/WalletTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bn } from "@/lib/bnMath";
import { CauseSymbol, allCauses, cause } from "@/types/Cause";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  HandHeartIcon,
  HomeIcon,
  SlidersHorizontalIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { times } from "remeda";

export const Game = () => {
  const deviceId = useAtomValue(deviceIdAtom);

  const [playerName, setPlayerName] = useState<string>("");
  const [chosenPlayerName, setChosenPlayerName] = useState<string | undefined>(
    undefined,
  );
  const [playerCause, setPlayerCause] = useState<CauseSymbol | undefined>(
    undefined,
  );
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  const game = useAtomValue(maybeGameAtom);
  useAtomValue(updateProvisionalValuationsEffect);
  const currentPlayer = useAtomValue(maybeCurrentPlayerAtom);
  const updateGame = useSetAtom(gameAtom);

  const setName = useCallback(() => {
    updateGame((game) => {
      game.players.push({
        deviceId,
        name: playerName,
        balances: [bn("100"), bn("0"), bn("0"), bn("20")],
        valuations: [bn("1"), bn("0"), bn("0"), bn("1")],
        cause: "PARK",
      });

      game.currencies
        .find((currency) => currency.symbol === "PARK")!
        .totalSupply.add(bn("20"));
    });
  }, [playerName, updateGame, deviceId]);

  if (!game) {
    return (
      <div className="h-full flex flex-col justify-evenly items-center p-4 ">
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="h-full flex flex-col justify-evenly items-center p-4 ">
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
        {chosenPlayerName && !playerCause && (
          <div className="flex flex-col items-center gap-2 w-full">
            <p>Hey {chosenPlayerName}!</p>
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
                  <CauseToken className="size-16" />
                  <p className="font-bold text-muted-foreground">
                    ${cause.symbol}
                  </p>
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

        {chosenPlayerName && playerCause && (
          <div className="flex flex-col items-center gap-10 w-full">
            <p className="text-muted-foreground">Hey {chosenPlayerName}!</p>
            <div className="flex flex-col gap-2">
              <p>You've decided to support</p>
              <div className="flex flex-col justify-between items-center gap-3 border rounded-lg p-4 text-wrap">
                <p className="text-lg">{cause[playerCause].name}</p>
                <CauseToken className="size-32" />
                <p className="font-bold text-muted-foreground">
                  ${cause[playerCause].symbol}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-0 w-full px-4">
              <Button
                variant="link"
                className="text-muted-foreground"
                onClick={() => setChosenPlayerName(undefined)}
              >
                Change name
              </Button>
              <Button
                variant="link"
                className="text-muted-foreground"
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

                    game.players.push({
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
                    });
                  })
                }
              >
                Join game
              </Button>
              x
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(value as "wallet" | "pay" | "valuations" | "causes");
      }}
      defaultValue="wallet"
      className="h-full w-full flex flex-col px-4 py-4 pb-14 "
    >
      <WalletTab />
      <PayTab />
      {!currentPlayer.isDealer && <CausesTab />}
      {!currentPlayer.isDealer && <ValuationsTab />}
      <div className="absolute left-0 bottom-0 w-full p-2 bg-muted">
        <TabsList className="w-full justify-evenly gap-2 h-14 ">
          {Object.entries(
            currentPlayer.isDealer
              ? { wallet: HomeIcon, pay: UsersRoundIcon }
              : {
                  wallet: HomeIcon,
                  valuations: SlidersHorizontalIcon,
                  causes: HandHeartIcon,
                  pay: UsersRoundIcon,
                },
          ).map(([key, Icon]) => (
            <TabsTrigger
              key={`${key}-trigger`}
              value={key}
              className="flex-grow flex gap-2 h-full data-[state=active]:bg-foreground/5 data-[state=active]:shadow-inner"
            >
              <Icon className="inline size-6" />
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
};
