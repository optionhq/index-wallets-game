import { NetworkValuationsChart } from "@/components/tabs/Market/NetworkValuationsChart";
import { TokenSuppliesChart } from "@/components/tabs/Market/TokenSuppliesChart";
import { WalletCompositionsChart } from "@/components/tabs/Market/WalletCompositionsChart";
import { TabsContent } from "@/components/ui/tabs";

export const MarketTab = () => {
  return (
    <TabsContent value="market" className="gap-4">
      <h2 className="mb-2 text-lg font-bold leading-none text-muted-foreground">
        Wallet Compositions
      </h2>
      <WalletCompositionsChart />
      <h2 className="mb-2 text-lg font-bold leading-none text-muted-foreground">
        Token supplies
      </h2>
      <TokenSuppliesChart />
      <h2 className="mb-2 text-lg font-bold leading-none text-muted-foreground">
        Network valuations
      </h2>
      <NetworkValuationsChart />
    </TabsContent>
  );
};
