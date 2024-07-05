import { currenciesAtom, playersAtom } from "@/components/Game.state";
import { characterColor, characterIcon, tokenColor } from "@/config";
import { useAtomValue } from "jotai";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const WalletCompositionsChart = () => {
  const players = useAtomValue(playersAtom);
  const currencies = useAtomValue(currenciesAtom);
  const data = players.map((player) => ({
    name: player.name,
    character: player.character,
    ...player.balances.reduce(
      (balances, balance, index) => {
        balances[currencies[index].symbol] = balance.toNumber();
        return balances;
      },
      {} as Record<string, number>,
    ),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          interval={0}
          dataKey="name"
          tick={({ x, y, index }) => {
            const RADIUS = 14;
            const PADDING = 4;
            return (
              <svg
                x={x - RADIUS}
                y={y - 4}
                width={2 * RADIUS}
                height={2 * RADIUS}
                viewBox={`0 0 ${2 * RADIUS} ${2 * RADIUS}`}
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
              </svg>
            );
          }}
        />
        <YAxis width={20} className="text-xs" />

        {currencies.map((currency) => (
          <Bar
            barSize={16}
            key={currency.symbol}
            dataKey={currency.symbol}
            stackId="a"
            fill={tokenColor[currency.symbol]}
          />
        ))}
        <Tooltip
          cursor={{
            fill: "hsl(47.9 95.8% 53.1% / 0.2)",
            strokeWidth: 2,
          }}
          labelClassName="font-bold pb-2"
          wrapperClassName="text-xs rounded-md shadow-sm opacity-95"
          itemStyle={{ padding: 0 }}
          formatter={(value: number) => value.toFixed(2)}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
