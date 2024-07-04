import { WalletCompositionsChart } from "@/components/tabs/Market/WalletCompositionsChart";
import { TabsContent } from "@/components/ui/tabs";

export const MarketTab = () => {
  return (
    <TabsContent value="market">
      <h2 className="text-lg font-bold text-muted-foreground leading-none mb-2">
        Wallet Compositions
      </h2>
      <WalletCompositionsChart />
    </TabsContent>
  );
};
