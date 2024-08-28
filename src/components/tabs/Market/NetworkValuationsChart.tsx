import {
  currenciesAtom,
  networkValuationsObservableAtom,
} from "@/components/Game.state";
import { tokenColor } from "@/config";
import { bn } from "@/lib/bnMath";
import { CurrencySymbol } from "@/types/Currency";
import { useAtomValue } from "jotai";
import { atomWithObservable } from "jotai/utils";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { scan } from "rxjs";

const dataAtom = atomWithObservable((get) => {
  const currencies = get(currenciesAtom);
  return get(networkValuationsObservableAtom).pipe(
    scan(
      (previousData, valuationsArray, index) => [
        ...previousData,
        {
          index,
          ...currencies.reduce(
            (valuations, _currency, index) => ({
              ...valuations,
              [currencies[index].symbol]: (
                valuationsArray?.[index] ?? bn(0)
              ).toNumber(),
            }),
            {} as Partial<Record<CurrencySymbol, number>>,
          ),
        },
      ],
      [] as ({
        index: number;
      } & Partial<Record<CurrencySymbol, number>>)[],
    ),
  );
});

export const NetworkValuationsChart = () => {
  const data = useAtomValue(dataAtom);
  const currencies = useAtomValue(currenciesAtom);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="index"
          type="number"
          scale="sequential"
          tick={false}
          interval={0}
        />
        <YAxis
          width={30}
          className="text-xs"
          padding={{ top: 10, bottom: 10 }}
          // domain={["dataMin - 0.1", "dataMax + 0.1"]}
        />
        <Tooltip
          allowEscapeViewBox={{ x: false, y: true }}
          position={{ y: 0 }}
          // labelFormatter={(_timestamp, points) => {
          //   const event = points?.[0]?.payload.event as Event | undefined;
          //   if (!event) return "";
          //   switch (event.type) {
          //     case "GAME_CREATED":
          //       return "Game created";
          //     case "PLAYER_JOINED":
          //       return `${event.name} joined the game`;
          //     case "DONATION_MADE":
          //       return `${players.find((player) => player.deviceId === event.playerId)?.name} donated to ${event.cause}`;
          //     case "PAYMENT_MADE":
          //       return `${players.find((player) => player.deviceId === event.from)?.name} paid ${players.find((player) => player.deviceId === event.to)?.name}`;
          //   }
          // }}
          labelClassName="hidden"
          wrapperClassName="text-xs rounded-md shadow-sm !bg-background/85 "
          itemStyle={{ padding: 0 }}
          formatter={(value: number) => value.toFixed(2)}
        />
        <ReferenceLine y={0} />
        <ReferenceArea
          y1={0}
          y2={-10000}
          fill="red"
          fillOpacity={0.05}
          ifOverflow="hidden"
        />
        {currencies.map((currency) => (
          <Line
            dot={false}
            type="bump"
            key={currency.symbol}
            dataKey={currency.symbol}
            stroke={tokenColor[currency.symbol]}
            strokeWidth={2}
            fill={tokenColor[currency.symbol]}
            fillOpacity={1}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
