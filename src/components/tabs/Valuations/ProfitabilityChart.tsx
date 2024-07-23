import {
  otherPlayersAtom,
  playerProvisionalValuationsAtom,
} from "@/components/Game.state";
import { characterColor, characterIcon, RETAIL_PRICE } from "@/config";
import { bn, bnMath } from "@/lib/bnMath";
import { compositePrice } from "@/lib/indexWallets/compositePrice";
import { price } from "@/lib/indexWallets/price";
import { valueOf } from "@/lib/indexWallets/valueOf";
import { useAtomValue } from "jotai";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const ProfitabilityChart = () => {
  const otherPlayers = useAtomValue(otherPlayersAtom);
  const currentPlayerValuations = useAtomValue(playerProvisionalValuationsAtom);

  const data = otherPlayers.flatMap((buyer) => {
    const buyerPayment = compositePrice({
      vendorPrice: bn(RETAIL_PRICE),
      buyerBalances: buyer.balances,
      vendorValuations: currentPlayerValuations,
    });

    const myPriceToThem = valueOf(buyerPayment, buyer.valuations)
      .clamp(0, 99.9)
      .toNumber();

    const priceFromOthers = otherPlayers.flatMap((p) => {
      if (p.name === buyer.name) return [];
      return [
        price({
          buyerBalances: p.balances,
          vendorPrice: bn(RETAIL_PRICE),
          vendorValuations: buyer.valuations,
          viewerValuations: p.valuations,
        })
          .clamp(-99.9, 99.9)
          .toNumber(),
      ];
    });

    const isBestPrice =
      priceFromOthers.length > 0
        ? myPriceToThem <= bnMath.min(priceFromOthers)
        : true;
    return {
      name: `${buyer.name}`,
      character: buyer.character,
      color: characterColor[buyer.character],
      priceToThem: myPriceToThem,
      isBestPrice,
      ...otherPlayers.reduce(
        (purchasingPowers, seller) => {
          const valueToSeller = valueOf(buyerPayment, seller.valuations);
          const purchasingPower = valueToSeller
            .div(bn(RETAIL_PRICE))
            .clamp(0, 100)
            .toNumber();
          if (isNaN(purchasingPower))
            console.log({
              buyerPayment: buyerPayment.map((v) => v.toNumber()),
              sellerValuations: seller.valuations.map((v) => v.toNumber()),
              valueToSeller: valueToSeller.toNumber(),
            });
          return {
            ...purchasingPowers,
            [seller.name]: purchasingPower,
          };
        },
        {} as Record<string, number>,
      ),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart
        data={data}
        stackOffset="sign"
        barGap={0.5}
        barCategoryGap={2}
        barSize={3}
        margin={{ top: 0, right: 0, left: 0 }}
      >
        <CartesianGrid strokeDasharray="2 1" vertical={false} />

        <XAxis
          height={64}
          interval={0}
          dataKey="name"
          tickLine={false}
          tick={({ x, y, index }) => {
            const RADIUS = 14;
            const PADDING = 4;
            const TEXT_HEIGHT = 16;
            return (
              <svg
                x={x - RADIUS}
                y={y - 6}
                width={2 * RADIUS}
                height={2 * RADIUS + TEXT_HEIGHT}
                viewBox={`0 0 ${2 * RADIUS} ${2 * RADIUS + TEXT_HEIGHT}`}
              >
                <circle
                  cx={RADIUS}
                  cy={RADIUS}
                  r={RADIUS}
                  fill={characterColor[data[index].character]}
                />
                <image
                  href={characterIcon[data[index].character]}
                  x={PADDING}
                  y={PADDING}
                  width={2 * (RADIUS - PADDING)}
                  height={2 * (RADIUS - PADDING)}
                />
                <text
                  textAnchor="middle"
                  x="50%"
                  // fill={characterColor[data[index].character]}
                  fill="gray"
                  fontSize={9}
                  y={2 * RADIUS + 10}
                >
                  ⱡ{data[index].priceToThem.toFixed(1)}
                </text>
                {data[index].isBestPrice && (
                  <text
                    textAnchor="middle"
                    x="50%"
                    fill="green"
                    fontSize={6}
                    y={2 * RADIUS + 16}
                  >
                    BEST
                  </text>
                )}
              </svg>
            );
          }}
        >
          <Label fontSize={10} position="insideBottom" offset={2}>
            Your price to them
          </Label>
        </XAxis>
        <YAxis ticks={[0, 1, 2]} domain={[0, 2]} allowDataOverflow width={20} />
        <Tooltip
          allowEscapeViewBox={{ y: true }}
          position={{ y: -150 }}
          labelClassName="w-24 text-wrap !mb-2"
          labelFormatter={(value: string, data) => {
            const color = data.find((entry) => entry.name === value)?.color;
            return (
              <>
                Selling <strong>1 item</strong> to <br />
                <strong style={{ color }}>{value}</strong>
                <br />
                buys you:
              </>
            );
          }}
          formatter={(value: number) =>
            value.toFixed(1) + (value === 1 ? " item" : " items")
          }
          wrapperClassName="text-xs rounded-md shadow-sm opacity-95 bg-background border p-2"
          itemStyle={{ padding: 0 }}
          offset={30}
          cursor={{
            fill: "hsl(47.9 95.8% 53.1% / 0.2)",
            strokeWidth: 2,
          }}
        />
        <ReferenceArea
          y1={1}
          y2={-10000}
          fill="gray"
          fillOpacity={0.1}
          ifOverflow="hidden"
        />
        {otherPlayers.map((player) => (
          <Bar
            key={player.name + "-bar"}
            name={player.name}
            dataKey={player.name}
            fill={characterColor[player.character]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
