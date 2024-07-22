import {
  activeTabAtom,
  currentAgentAtom,
  selectedPayeeAtom,
} from "@/components/Game.state";
import { TripleDotMenu } from "@/components/TrippleDotMenu";
import { CausesTab } from "@/components/tabs/Causes/CausesTab";
import { MarketTab } from "@/components/tabs/Market/MarketTab";
import { PayTab } from "@/components/tabs/Pay/PayTab";
import { ValuationsTab } from "@/components/tabs/Valuations/ValuationsTab";
import { WalletTab } from "@/components/tabs/Wallet/WalletTab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/lib/game/useNotifications";
import useWakeLock from "@/lib/game/useWakeLock";
import { useAtom, useAtomValue } from "jotai";
import {
  AreaChartIcon,
  HandHeartIcon,
  HomeIcon,
  Settings2Icon,
  StoreIcon,
  UsersRoundIcon,
} from "lucide-react";

export const Game = () => {
  useNotifications();
  useWakeLock();
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const currentPlayer = useAtomValue(currentAgentAtom);
  const selectedPayee = useAtomValue(selectedPayeeAtom);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(
          value as "wallet" | "pay" | "valuations" | "causes" | "market",
        );
      }}
      defaultValue="wallet"
      className="h-full overflow-clip w-full flex flex-col"
    >
      <div className="w-full grid grid-cols-[36px_1fr_36px] shrink-0 items-center shadow-sm border-b justify-between h-10 bg-muted">
        <h1 className="col-start-2 text-center font-bold text-lg text-muted-foreground">
          {activeTab === "wallet" && "Balances"}
          {activeTab === "pay" && (selectedPayee ? "Paying" : "Pay")}
          {activeTab === "valuations" && "Valuations"}
          {activeTab === "causes" && "Donate to a Cause"}
          {activeTab === "market" && "Market"}
        </h1>
        <TripleDotMenu />
      </div>
      <WalletTab />
      <PayTab />
      {!currentPlayer.isDealer && <CausesTab />}
      {!currentPlayer.isDealer && <ValuationsTab />}
      <MarketTab />
      <TabsList className="w-full shrink-0 rounded-none bg-muted m-0 p-2 justify-evenly gap-2 h-16 border-t overflow-clip">
        {Object.entries(
          currentPlayer.isDealer
            ? { wallet: HomeIcon, pay: UsersRoundIcon, market: AreaChartIcon }
            : {
                wallet: HomeIcon,
                valuations: Settings2Icon,
                causes: HandHeartIcon,
                pay: StoreIcon,
                market: AreaChartIcon,
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
    </Tabs>
  );
};
