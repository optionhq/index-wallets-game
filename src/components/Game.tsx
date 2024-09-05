import {
  activeTabAtom,
  currentAgentAtom,
  selectedCauseAtom,
  selectedPayeeAtom,
} from "@/components/Game.state";
import { TripleDotMenu } from "@/components/TrippleDotMenu";
import { BuyTab } from "@/components/tabs/Buy/BuyTab";
import { CausesTab } from "@/components/tabs/Causes/CausesTab";
import { MarketTab } from "@/components/tabs/Market/MarketTab";
import { StorefrontTab } from "@/components/tabs/Storefront/StorefrontTab";
import { WalletTab } from "@/components/tabs/Wallet/WalletTab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";
import { useNotifications } from "@/lib/game/useNotifications";
import useWakeLock from "@/lib/game/useWakeLock";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  AreaChartIcon,
  HeartHandshakeIcon,
  HomeIcon,
  SendIcon,
  ShoppingCartIcon,
  StoreIcon,
} from "lucide-react";

export const Game = () => {
  useNotifications();
  useWakeLock();
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const currentPlayer = useAtomValue(currentAgentAtom);
  const [selectedPayee, setSelectedPayee] = useAtom(selectedPayeeAtom);
  const setSelectedCause = useSetAtom(selectedCauseAtom);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(
          value as "wallet" | "buy" | "storefront" | "causes" | "market",
        );
      }}
      defaultValue="wallet"
      className="h-full overflow-clip w-full flex flex-col"
    >
      <div className="w-full grid grid-cols-[36px_1fr_36px] shrink-0 items-center shadow-sm border-b justify-between h-10 bg-muted">
        <h1 className="col-start-2 text-center font-bold text-lg text-muted-foreground">
          {activeTab === "wallet" && "Balances"}
          {activeTab === "buy" && (selectedPayee ? "Buying from" : "Buy")}
          {activeTab === "storefront" && "Storefront"}
          {activeTab === "causes" && "Donate to a Cause"}
          {activeTab === "market" && "Market"}
        </h1>
        <TripleDotMenu />
      </div>
      <WalletTab />
      <BuyTab />
      {!currentPlayer.isDealer && <CausesTab />}
      {!currentPlayer.isDealer && <StorefrontTab />}
      <MarketTab />
      <TabsList className="w-full shrink-0 rounded-none bg-muted m-0 p-2 justify-evenly gap-2 h-16 border-t overflow-clip">
        {Object.entries(
          currentPlayer.isDealer
            ? { wallet: HomeIcon, buy: SendIcon, market: AreaChartIcon }
            : {
                wallet: HomeIcon,
                storefront: StoreIcon,
                buy: ShoppingCartIcon,
                causes: HeartHandshakeIcon,
                market: AreaChartIcon,
              },
        ).map(([key, Icon]) => (
          <TabsTrigger
            key={`${key}-trigger`}
            value={key}
            className="flex-grow flex gap-2 h-full data-[state=active]:bg-foreground/5 data-[state=active]:shadow-inner"
            onClick={
              key === "buy"
                ? () => {
                    activeTab === "buy" && setSelectedPayee(undefined);
                  }
                : key === "causes"
                  ? () => {
                      activeTab === "causes" && setSelectedCause(undefined);
                    }
                  : undefined
            }
          >
            <Icon className={cn("inline size-6", key === "buy" && "size-7")} />
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
