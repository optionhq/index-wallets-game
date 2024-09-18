import { currenciesAtom } from "@/components/Game.state";
import { NetworkValuationsChart } from "@/components/tabs/Market/NetworkValuationsChart";
import { TokenSuppliesChart } from "@/components/tabs/Market/TokenSuppliesChart";
import { WalletCompositionsChart } from "@/components/tabs/Market/WalletCompositionsChart";
import { TokenBadge } from "@/components/TokenBadge";
import { TabsContent } from "@/components/ui/tabs";
import { useAtomValue } from "jotai";

export const MarketTab = () => {
  const currencies = useAtomValue(currenciesAtom);
  return (
    <TabsContent value="market" className="gap-4">
      <h2 className="mb-2 text-lg font-bold leading-none text-muted-foreground">
        Wallet Compositions
      </h2>
      <WalletCompositionsChart />
      <h2 className="mb-2 text-lg font-bold leading-none text-muted-foreground">
        Total donations
      </h2>
      <div className="flex flex-wrap justify-evenly gap-6">
        {currencies.slice(1).map((currency) => (
          <div key={currency.name} className="flex flex-col items-center">
            <div className="flex flex-col items-center">
              <TokenBadge token={currency.symbol} className="size-10" />
              <span className="text-muted-foreground">{currency.symbol}</span>
            </div>
            <p className="text-md font-bold">
              ${currency.totalSupply.toFixed(0)}
            </p>
          </div>
        ))}
      </div>
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
