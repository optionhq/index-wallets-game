import { MarketValuationsChart } from "@/components/tabs/Market/MarketValuationsChart";
import { TokenSuppliesChart } from "@/components/tabs/Market/TokenSuppliesChart";
import { WalletCompositionsChart } from "@/components/tabs/Market/WalletCompositionsChart";
import { TabsContent } from "@/components/ui/tabs";

export const MarketTab = () => {
  return (
    <TabsContent value="market" className="gap-4">
      <h2 className="text-lg font-bold text-muted-foreground leading-none mb-2">
        Wallet Compositions
      </h2>
      <WalletCompositionsChart />
      <h2 className="text-lg font-bold text-muted-foreground leading-none mb-2">
        Token supplies
      </h2>
      <TokenSuppliesChart />
      <h2 className="text-lg font-bold text-muted-foreground leading-none mb-2">
        Transacted token valuations
      </h2>
      <MarketValuationsChart />
    </TabsContent>
  );
};
