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
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  HandHeartIcon,
  HomeIcon,
  SlidersHorizontalIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useCallback, useState } from "react";

export const Game = () => {
  const deviceId = useAtomValue(deviceIdAtom);

  const [playerName, setPlayerName] = useState<string>("");
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
        <div className="flex flex-col items-center gap-2 w-full max-w-64">
          <p>Enter your name</p>
          <Input
            maxLength={20}
            className="h-16 w-full  text-lg "
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setName();
            }}
          />
          <Button className="w-full" onClick={setName}>
            Submit
          </Button>
        </div>
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
      <CausesTab />
      <ValuationsTab />
      <div className="absolute left-0 bottom-0 w-full p-2 bg-muted">
        <TabsList className="w-full justify-evenly gap-2 h-14 ">
          {Object.entries({
            wallet: HomeIcon,
            valuations: SlidersHorizontalIcon,
            causes: HandHeartIcon,
            pay: UsersRoundIcon,
          }).map(([key, Icon]) => (
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
